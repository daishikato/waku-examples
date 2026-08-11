import adapter from 'waku/adapters/default';
import { Slot_UNSTABLE as Slot } from 'waku/minimal/client';
import App from './components/App';

const stringToStream = (str: string): ReadableStream => {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(str));
      controller.close();
    },
  });
};

export default adapter({
  handleRequest: async (input, { renderRsc, renderHtml }) => {
    if (input.type === 'rsc') {
      return renderRsc({ App: <App name={input.rscPath || 'Waku'} /> });
    }
    if (input.type === 'http' && input.pathname === '/') {
      return renderHtml(
        await renderRsc({ App: <App name="Waku" /> }),
        <Slot id="App" />,
        {
          rscPath: '',
        },
      );
    }
    if (input.type === 'http' && input.pathname === '/api/hello') {
      return stringToStream('world');
    }
  },
  handleBuild: async () => {},
});
