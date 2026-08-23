import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import bo from '@/styles/backoffice.module.css'
import { ErrorDisplay } from '@/shared/components/ErrorDisplay'
import { loginFormSchema, type LoginFormValues } from '../schemas/auth.schema'
import { useLogin } from '../hooks/useLogin'

export function LoginForm() {
  const { login, isLoading, error } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form onSubmit={handleSubmit((values) => login(values))} noValidate>
      <div className={bo.field}>
        <label className={bo.label} htmlFor="login-email">
          Email
        </label>
        <input id="login-email" type="email" className={bo.input} autoComplete="username" autoFocus {...register('email')} />
        {errors.email && <p className={bo.errorText}>{errors.email.message}</p>}
      </div>
      <div className={bo.field}>
        <label className={bo.label} htmlFor="login-password">
          Contraseña
        </label>
        <input
          id="login-password"
          type="password"
          className={bo.input}
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && <p className={bo.errorText}>{errors.password.message}</p>}
      </div>

      <ErrorDisplay error={error} className={bo.field} />

      <button type="submit" className={bo.btnPrimary} style={{ width: '100%' }} disabled={isLoading}>
        {isLoading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  )
}
