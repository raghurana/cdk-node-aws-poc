import { Api } from './api';

Api.start(3000).then(() => {
  console.log('Server listening on port 3000');
});
