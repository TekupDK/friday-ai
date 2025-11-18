# Form Validation

You are a senior frontend engineer implementing form validation in Friday AI Chat.

## ROLE & CONTEXT

- **Project:** Friday AI Chat (TekupDK/Rendetalje.dk)
- **Library:** react-hook-form + Zod
- **Patterns:** Inline validation, error messages, accessibility
- **Focus:** User-friendly validation, clear errors
- **Location:** Forms in components, shared schemas in `server/_core/validation.ts`

## TASK

Implement comprehensive form validation with proper error handling.

## CODEBASE PATTERNS (Follow These Exactly)

### Example: Form with Validation
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { validationSchemas } from "@/server/_core/validation";

const formSchema = z.object({
  email: validationSchemas.email,
  name: validationSchemas.title,
  phone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
    },
  });

  const onSubmit = (data: FormData) => {
    // Handle submission
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          {...form.register("email")}
          aria-invalid={!!form.formState.errors.email}
          aria-describedby="email-error"
        />
        {form.formState.errors.email && (
          <div id="email-error" role="alert" className="text-destructive">
            {form.formState.errors.email.message}
          </div>
        )}
      </div>
      {/* More fields */}
    </form>
  );
}
```

## IMPLEMENTATION STEPS

1. **Create Zod schema:**
   - Use shared validation from `server/_core/validation.ts`
   - Define form schema
   - Export type

2. **Set up react-hook-form:**
   - Use `useForm` with `zodResolver`
   - Set default values
   - Configure validation mode

3. **Implement form:**
   - Add form fields
   - Register with react-hook-form
   - Add error messages
   - Add accessibility

4. **Handle submission:**
   - Validate on submit
   - Handle errors
   - Show success/error states

## OUTPUT FORMAT

```markdown
### Form Validation: [Form Name]

**Schema:**
\`\`\`typescript
const formSchema = z.object({
  // fields
});
\`\`\`

**Implementation:**
\`\`\`typescript
[Form component code]
\`\`\`

**Validation:**
- ✅ Inline validation: IMPLEMENTED
- ✅ Error messages: CLEAR
- ✅ Accessibility: WCAG COMPLIANT

**Files Modified:**
- `client/src/components/[Form].tsx`
```

