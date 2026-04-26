# Security Specification

## Data Invariants
1. A user can only be created by an Admin.
2. Students can only be modified by specific roles (Admin, Registrar, Coordinator, Data Entry).
3. The total score must be correctly bounded.

## Dirty Dozen Payloads
1. Create user as a non-admin.
2. Edit a student without write access.
3. Access a user with string size > 1MB.
4. (More...)

## Test Runner
(Not implemented)