import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { adminAuth } from '$lib/server/firebase'
import type { FirebaseError } from 'firebase-admin'
import postmark from 'postmark'
import { POSTMARK_API_TOKEN } from '$env/static/private'
import { addDataToHtmlTemplate } from '$lib/utils'
import { actionEmailTemplate } from '$lib/data/emailTemplates/actionEmailTemplate'

export const POST: RequestHandler = async ({ request, locals }) => {
  let topError
  try {
    const body = await request.json()
    let to
    let data
    const firstName = body.firstName
    try {
      switch (body.type) {
        case 'verifyEmail': {
          let email: string
          if (locals && 'user' in locals) {
            if (locals.user === null) {
              throw 'User not signed in.'
            } else {
              email = locals.user.email
            }
          } else {
            email = body.email
          }
          console.log('verification email')
          const link = await adminAuth.generateEmailVerificationLink(email)
          to = email
          data = {
            subject: 'Verify Your Email for HackHarvard',
            action: {
              link,
              name: 'Verify Your Email',
              firstName: firstName,
              buttonname: 'Verify Email',
              description:
                'Thank you for starting the HackHarvard application process! To proceed, please verify your email for your HackHarvard account by clicking the button below. We are excited to see your application!',
            },
          }
          break
        }
        case 'changeEmail': {
          if (locals.user === null) {
            throw 'User not signed in.'
          }
          if (body.newEmail) {
            const link = await adminAuth.generateVerifyAndChangeEmailLink(
              locals.user.email,
              body.newEmail,
            )
            to = body.newEmail
            data = {
              subject: 'HackHarvard Email Change Request',
              firstName: firstName,
              action: {
                link,
                name: 'Email Change Requested',
                buttonname: 'Confirm Email Change',
                description: `We recently received a request to change the email of your HackHarvard account. Please confirm that you want to change your email from ${locals.user.email} to ${body.newEmail} by clicking the button below.`,
              },
            }
          } else {
            topError = error(400, 'Invalid request body.')
          }
          break
        }
        case 'resetPassword': {
          const link = await adminAuth.generatePasswordResetLink(body.email)
          to = body.email
          data = {
            subject: 'HackHarvard Password Reset Request',
            action: {
              link,
              firstName: firstName,
              name: 'Password Reset Requested',
              buttonname: 'Reset Password',
              description:
                'We recently received a request to reset the password of your HackHarvard account. To reset your password, please click the button below.',
            },
          }
          break
        }
        case 'decisionAccept': {
          const link = 'https://portal.hackharvard.io'
          to = body.email
          data = {
            subject: 'HackHarvard Admissions Update',
            action: {
              link,
              firstName: firstName,
              name: 'Congradulations!',
              buttonname: 'Accept Your Spot',
              description:
                'Congrats! We are incredibly excited to invite you to participate in HackHarvard 2024. Further logistical information and ways to meet other hackers will be sent to your inboxes soon, so keep an eye out! To officially confirm your spot, please fill out this form within three days of receiving this email.',
            },
          }
          break
        }
        default: {
          topError = error(400, 'Invalid action type.')
        }
      }
      const template = {
        name: 'action',
        data: {
          ...data,
          app: {
            name: 'Portal',
            link: 'https://portal.hackharvard.io',
          },
        },
      }

      // get html template from firebase

      const htmlBody = addDataToHtmlTemplate(actionEmailTemplate, template)

      const emailData: Data.EmailData = {
        From: 'team@hackharvard.io',
        To: to,
        Cc: '',
        Subject: String(template.data.subject),
        HTMLBody: htmlBody,
        ReplyTo: 'tech@hackharvard.io',
        MessageStream: 'outbound',
      }

      try {
        const client = new postmark.ServerClient(POSTMARK_API_TOKEN)
        await client.sendEmail(emailData)
        return new Response()
      } catch (err) {
        topError = error(400, 'Failed to send email.')
      }
    } catch (err) {
      if (typeof err === 'string') {
        topError = error(400, err)
      } else {
        const typedErr = err as
          | FirebaseError
          | {
              errorInfo: FirebaseError
              codePrefix: string
            }
        if ('errorInfo' in typedErr) {
          topError = error(
            400,
            typedErr.errorInfo.message ||
              'Please wait a few minutes before trying again.',
          )
        } else if ('message' in typedErr) {
          topError = error(400, typedErr.message)
        } else {
          topError = error(400, 'Something went wrong. Please try again.')
        }
      }
    }
  } catch (err) {
    topError = error(400, 'Invalid request body.')
  }
  throw topError
}
