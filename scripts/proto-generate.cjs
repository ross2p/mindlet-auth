#!/usr/bin/env node
// Generates this service's ts-proto types from the shared .proto contracts shipped in
// `@ross2p/common` (dist/protos). Each service generates only the domains it talks to:
//   node scripts/proto-generate.cjs course team user
// Output: generated/protos (gitignored, next to the Prisma client); index.ts there is the generated barrel.
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const domains = process.argv.slice(2);
if (domains.length === 0) {
  console.error('usage: proto-generate.cjs <domain>...');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const protoRoot = path.join(
  path.dirname(require.resolve('@ross2p/common/package.json')),
  'dist',
  'protos',
);
const outDir = path.join(root, 'generated', 'protos');
const protoc = path.join(
  path.dirname(require.resolve('grpc-tools/package.json')),
  'bin',
  'protoc',
);
const tsProtoPlugin = path.join(
  path.dirname(require.resolve('ts-proto/package.json')),
  'protoc-gen-ts_proto',
);

const files = domains.flatMap((domain) => {
  const dir = path.join(protoRoot, domain);
  if (!fs.existsSync(dir)) {
    console.error(`proto domain "${domain}" not found in ${protoRoot}`);
    process.exit(1);
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.proto'))
    .sort()
    .map((file) => `${domain}/${file}`);
});

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

execFileSync(
  protoc,
  [
    `--plugin=protoc-gen-ts_proto=${tsProtoPlugin}`,
    `--ts_proto_out=${outDir}`,
    '--ts_proto_opt=nestJs=true,esModuleInterop=true,outputServices=grpc-js,useDate=true,useNullAsOptional=true,stringEnums=true,unrecognizedEnum=false',
    `--proto_path=${protoRoot}`,
    ...files,
  ],
  { stdio: 'inherit' },
);

// The barrel (generated/protos/index.ts) re-exports every generated file as one namespace, named
// <Domain>Proto after the file: `course/course.proto` -> CourseCoreProto, `team/team-view.proto`
// -> TeamViewProto, `user/username.proto` -> UsernameProto. Namespaced (not `export *`) because
// every generated file independently exports its own `protobufPackage` and `MessageFns`.
const pascal = (value) =>
  value
    .split('-')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');
const namespaceOf = (domain, name) => {
  if (name === domain) return `${pascal(domain)}CoreProto`;
  if (name.startsWith(domain)) return `${pascal(name)}Proto`;
  return `${pascal(domain)}${pascal(name)}Proto`;
};
fs.writeFileSync(
  path.join(outDir, 'index.ts'),
  files
    .map((file) => {
      const [domain, base] = file.replace(/\.proto$/, '').split('/');
      return `export * as ${namespaceOf(domain, base)} from './${domain}/${base}';\n`;
    })
    .join(''),
);
