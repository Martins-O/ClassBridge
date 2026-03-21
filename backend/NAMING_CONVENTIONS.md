# Model Naming Conventions

## TypeScript Interface Naming
- Use `I` prefix for interfaces (e.g., `IUser`, `IClass`)
- Use descriptive names that describe the entity

## Type Naming
- Use `T` prefix for type aliases (e.g., `TUserRole`)

## Schema Variable Naming
- Use PascalCase with `Schema` suffix (e.g., `UserSchema`, `ClassSchema`)

## Model Export Naming
- Use PascalCase without prefix (e.g., `User`, `Class`)
- Export as default and named (e.g., `export default User; export { User as UserModel };`)

## Field Naming
- Use camelCase for all field names (e.g., `schoolId`, `createdAt`)
- Use singular names for single entities (e.g., `userId`, not `userIds`)
- Use plural names for arrays (e.g., `studentIds`, `classIds`)
- Use descriptive names (e.g., `createdAt`, `updatedAt` for timestamps)

## Enum/Constant Naming
- Use SCREAMING_SNAKE_CASE for enum values (e.g., `UserRole.SCHOOL_ADMIN`)
- Use PascalCase for enum type names (e.g., `UserRole`)

## Index Naming Convention
- Compound index: `{field1}_{field2}_{direction}` (e.g., `schoolId_1_academicYear_1`)

## Example

```typescript
// Interface - I prefix
export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
}

// Schema - Schema suffix
const UserSchema = new Schema({ ... });

// Model - PascalCase
const User = mongoose.model<IUser>('User', UserSchema);
export default User;
export { User as UserModel };
```
