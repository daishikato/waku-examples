import { Link } from 'waku';
import { photoIds } from '../photos';

export const Feed = () => (
  <ul className="feed">
    {photoIds.map((id) => (
      <li key={id}>
        <Link to={{ to: '/photos/[id]', params: { id } }}>{id}</Link>
      </li>
    ))}
  </ul>
);
