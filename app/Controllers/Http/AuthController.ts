import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import UserLoginValidator from 'App/Validators/UserLoginValidator'
import Mail from '@ioc:Adonis/Addons/Mail'

export default class AuthController {
  public async login(ctx: HttpContextContract) {
    const { auth, response, request } = ctx
    try {
      await request.validate(UserLoginValidator)
      const email = request.input('email')
      const password = request.input('password')
      try {
        const token = await auth.use('api').attempt(email, password, {
          expiresIn: '1hour',
        })
        const mail = await Mail.sendLater((message) => {
          message
            .from('contact@tibstudio.fr')
            .to('tibz411@gmail.com')
            .subject('Welcome Onboard!')
            .textView('emails/welcome', {})
          // .htmlView('emails/welcome', { name: 'Virk' })
        })
        console.log(mail)
        return token.toJSON()
      } catch {
        return response.badRequest({ error: 'Invalid credentials' })
      }
    } catch (error) {
      response.badRequest(error.messages)
    }
  }
  public async refresh(ctx: HttpContextContract) {
    const { auth, response, request } = ctx
    try {
      const user = await auth.user
      await auth.use('api').revoke()
      const token = await auth.use('api').generate(user, {
        expiresIn: '1hour',
      })
      return token.toJSON()
    } catch (error) {
      response.badRequest(error.messages)
    }
  }
  public async logout(ctx: HttpContextContract) {
    const { auth, response } = ctx
    try {
      await auth.use('api').revoke()
      return {
        logout: true,
      }
    } catch (error) {
      console.log(error.message)
      response.badRequest({
        error: error.message,
      })
    }
  }
  public async me(ctx: HttpContextContract) {
    const { auth, response } = ctx
    try {
      console.log(auth.user)
      return auth.user?.toJSON()
    } catch (error) {
      console.log(error.message)
      response.badRequest({
        error: error.message,
      })
    }
  }
}
