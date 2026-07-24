import adapter from 'waku/adapters/default';
import { Slot } from 'waku/minimal/client';
import { runWithRerender } from './als';
import App from './components/App';

export default adapter({
  handleRequest: async (input, { renderRsc, renderHtml }) => {
    if (input.type === 'rsc') {
      return renderRsc({ App: <App name={input.rscPath || 'Waku'} /> });
    }
    if (input.type === 'call') {
      const elements: Record<string, unknown> = {};
      const rerender = (rscPath: string) => {
        elements.App = <App name={rscPath || 'Waku'} />;
      };
      const value = await runWithRerender(rerender, () =>
        input.fn(...input.args),
      );
      return renderRsc(elements, { value });
    }
    if (input.type === 'http' && input.pathname === '/') {
      let formState: unknown;
      if (input.tryAction) {
        const result = await input.tryAction();
        if (result.action) {
          formState = result.formState;
        }
      }
      return renderHtml(
        await renderRsc({ App: <App name="Waku" /> }),
        <Slot id="App" />,
        {
          rscPath: '',
          formState,
        },
      );
    }
  },
  handleBuild: async () => {},
});
