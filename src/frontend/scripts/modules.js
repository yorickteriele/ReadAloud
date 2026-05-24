export const modules = [
  {
    name: 'readaloud',
    specFile: 'readaloud.openapi.json',
    swaggerPath: '/swagger/readaloud/swagger.json',
    output: 'src/api/generated/api-client.ts',
    className: 'ReadAloudApiClient',
  },
]
