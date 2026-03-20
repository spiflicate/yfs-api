Simple TODO list for the project. This is not meant to be exhaustive, just a place to jot down things that need to be done.

Use the following format for each entry:

- [ ] (TODO/FIXME, human/agent) Description of the task. [Related file](path/to/file) or [Related context](link/to/context)


## TODO List

- [ ] (TODO, human) Add a regression test for invalid `out` values, so both transition rules and expansion rules are covered. [builder.ts](src/request/builder.ts)
- [ ] (TODO, human) Extend the same exact out-aware inference to any remaining public helper types that still only expose stage-only inference. [builder.ts](src/request/builder.ts)
- [ ] (TODO, human) Add one more compile-time test for param('out', 'settings,standings') specifically, since comma-separated string parsing is now part of the type flow. [request-builder.test.ts](tests/unit/request-builder.test.ts)