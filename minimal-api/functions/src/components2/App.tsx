import { Balancer } from 'react-wrap-balancer';
import ButtonServer from './ButtonServer';
import Counter from './Counter';
import { getCounter, greet, increment } from './funcs';

const App = ({ name }: { name: string }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Waku</title>
      </head>
      <body>
        <div
          style={{ border: '3px red dashed', margin: '1em', padding: '1em' }}
        >
          <h1>Hello {name}!!</h1>
          <h3>This is a server component.</h3>
          <p>Server counter: {getCounter()}</p>
          <Counter greet={greet} increment={increment} />
          <Balancer>My Awesome Title</Balancer>
          <ButtonServer name="Button1" />
          <ButtonServer name="Button2" />
        </div>
      </body>
    </html>
  );
};

export default App;
