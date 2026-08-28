import { readFileSync } from 'fs';
import { join } from 'path';

describe('AppModule (ADR-0004)', () => {
  it('does not mount a public HTTP RouterModule', () => {
    const src = readFileSync(join(__dirname, 'app.module.ts'), 'utf8');
    expect(src).not.toMatch(/RouterModule/);
  });

  it('registers Kafka CredentialsController, not HTTP routes', () => {
    const controller = readFileSync(
      join(__dirname, 'credentials/credentials.controller.ts'),
      'utf8',
    );
    expect(controller).toMatch(/MessagePattern/);
    expect(controller).not.toMatch(/@Post\(/);
    const src = readFileSync(
      join(__dirname, 'credentials/credentials.module.ts'),
      'utf8',
    );
    expect(src).toMatch(/CredentialsController/);
  });
});
