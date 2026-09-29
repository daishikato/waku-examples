'use server';

import { z } from 'zod';
import {
  unstable_redirect as redirect,
  unstable_rerenderRoute as rerenderRoute,
} from 'waku/router/server';
import { sql } from './db';
import { requireSession, signIn } from './session';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ date: true, id: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  await requireSession();
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  // Insert data into the database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error) {
    // If a database error occurs, return a more specific error.
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // No revalidatePath(): Waku caches nothing, so the redirect below renders the
  // invoices page with fresh data.
  redirect('/dashboard/invoices', 303);
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  await requireSession();
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  redirect('/dashboard/invoices', 303);
}

export async function deleteInvoice(id: string) {
  await requireSession();
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  rerenderRoute();
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') || '');

  const parsed = z
    .object({ email: z.string().email(), password: z.string().min(6) })
    .safeParse({ email, password });
  if (!parsed.success) {
    return 'Invalid credentials.';
  }

  if (!(await signIn(parsed.data.email, parsed.data.password))) {
    return 'Invalid credentials.';
  }

  // 303 so a browser following the redirect without JavaScript issues a GET;
  // the default 307 would re-send the form POST to the destination.
  redirect(dashboardPath(redirectTo), 303);
}

// The callback URL comes from the login page's query string, so anyone can
// write one. next-auth only followed it within its own origin; this only
// follows a dashboard path, which is all the dashboard layout sends. The cast
// is needed because redirect() is typed against the app's routes.
const dashboardPath = (url: string) => {
  try {
    const { origin, pathname, search } = new URL(url, 'http://localhost');
    if (origin === 'http://localhost' && /^\/dashboard(\/|$)/.test(pathname)) {
      return `${pathname}${search}` as Parameters<typeof redirect>[0];
    }
  } catch {
    // Not a URL at all.
  }
  return '/dashboard';
};
