let _client = null;

export function setLDClient(client) {
  _client = client;
}

export function getLDClient() {
  return _client;
}