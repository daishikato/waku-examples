import type { ReactNode } from 'react';
import { Link } from 'waku/router/client';
import { Pending } from './pending';

import '../styles.css';

const getCurrentTime = () => new Date();

const BarLayout = ({ children }: { children: ReactNode }) => {
  const currentTime = getCurrentTime();
  return (
    <div>
      <p>This layout is dynamic. Rendered at: {currentTime.toISOString()}</p>
      <ul>
        <li>
          <Link to="/">
            Home
            <Pending />
          </Link>
        </li>
        <li>
          <Link to="/foo">
            Foo
            <Pending />
          </Link>
        </li>
        <li>
          <Link to={'/nested/bar' as never}>
            Link to 404
            <Pending />
          </Link>
        </li>
      </ul>
      {children}
    </div>
  );
};

export default BarLayout;
