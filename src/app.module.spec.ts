import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppModule (ADR-0004)', () => {
  it('does not mount a public HTTP RouterModule', () => {
    const src = readFileSync(join(__dirname, 'app.module.ts'), 'utf8');
    expect(src).not.toMatch(/RouterModule/);
  });

  it('does not register HTTP CredentialsController on the Kafka app', () => {
    const src = readFileSync(
      join(__dirname, 'credentials/credentials.module.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/from '\.\/credentials\.controller'/);
    expect(src).toMatch(/CredentialsMessageController/);
  });
});
