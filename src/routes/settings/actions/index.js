/**
 * Settings related actions
 */
import _ from 'lodash'
import {
  CHECK_EMAIL_AVAILABILITY_PENDING,
  CHECK_EMAIL_AVAILABILITY_SUCCESS,
  CHECK_EMAIL_AVAILABILITY_FAILURE,
  CHANGE_EMAIL_PENDING,
  CHANGE_EMAIL_SUCCESS,
  CHANGE_EMAIL_FAILURE,
  CHANGE_PASSWORD_PENDING,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  GET_NOTIFICATION_SETTINGS_PENDING,
  GET_NOTIFICATION_SETTINGS_SUCCESS,
  GET_NOTIFICATION_SETTINGS_FAILURE,
  SAVE_NOTIFICATION_SETTINGS_PENDING,
  SAVE_NOTIFICATION_SETTINGS_SUCCESS,
  SAVE_NOTIFICATION_SETTINGS_FAILURE,
  GET_PROFILE_SETTINGS_PENDING,
  GET_PROFILE_SETTINGS_SUCCESS,
  GET_PROFILE_SETTINGS_FAILURE,
  SAVE_PROFILE_SETTINGS_PENDING,
  SAVE_PROFILE_SETTINGS_SUCCESS,
  SAVE_PROFILE_SETTINGS_FAILURE,
  SAVE_PROFILE_PHOTO_PENDING,
  SAVE_PROFILE_PHOTO_SUCCESS,
  SAVE_PROFILE_PHOTO_FAILURE,
  GET_SYSTEM_SETTINGS_PENDING,
  GET_SYSTEM_SETTINGS_SUCCESS,
  RESET_PASSWORD_PENDING,
  RESET_PASSWORD_SUCCESS,
  RESET_PASSWORD_FAILURE,
} from '../../../config/constants'
import settingsService from '../services/settings'
import * as memberService from '../../../api/users'
import { uploadFileToS3 } from '../../../api/s3'
import { applyProfileSettingsToTraits } from '../helpers/settings'
import Alert from 'react-s-alert'


export const getSystemSettings = () => (dispatch, getState) => {
  dispatch({
    type: GET_SYSTEM_SETTINGS_PENDING
  })
  const state = getState()
  const handle = _.get(state, 'loadUser.user.handle')
  settingsService.getSystemSettings(handle)
    .then(data => {
      dispatch({
        type: GET_SYSTEM_SETTINGS_SUCCESS,
        payload: { data }
      })
    })
}

export const checkEmailAvailability = (email) => (dispatch) => {
  dispatch({
    type: CHECK_EMAIL_AVAILABILITY_PENDING,
    payload: { email }
  })
  settingsService.checkEmailValidity(email)
    .then(data => {
      const isEmailAvailable = _.get(data, 'result.content.valid')
      dispatch({
        type: CHECK_EMAIL_AVAILABILITY_SUCCESS,
        payload: {email, isEmailAvailable}
      })
    })
    .catch(err => {
      dispatch({
        type: CHECK_EMAIL_AVAILABILITY_FAILURE,
        payload: {error: err.message}
      })
    })
}

export const changeEmail = (email) => (dispatch, getState) => {
  dispatch({
    type: CHANGE_EMAIL_PENDING
  })
  const state = getState()
  const handle = _.get(state, 'loadUser.user.handle')
  const profile = _.get(state, 'settings.system.settings')
  const newProfile = {...profile,
    email,
  }
  settingsService.updateSystemSettings(handle, newProfile)
    .then(data => {
      const profile = _.get(data, 'result.content')
      dispatch({
        type: CHANGE_EMAIL_SUCCESS,
        payload: { data: profile }
      })
    })
    .catch(err => {
      Alert.error(`Failed to update email: ${err.message}`)
      dispatch({
        type: CHANGE_EMAIL_FAILURE,
      })
    })
}

export const changePassword = (credential) => (dispatch, getState) => {
  dispatch({
    type: CHANGE_PASSWORD_PENDING
  })
  const state = getState()
  const userId = _.get(state, 'settings.system.settings.userId')
  settingsService.updatePassword(credential, userId)
    .then(() => {
      Alert.success('Password changed successfully')
      dispatch({
        type: CHANGE_PASSWORD_SUCCESS
      })
    })
    .catch(err => {
      const msg = _.get(err, 'response.data.result.content') || err.message
      Alert.error(`Failed to update password: ${msg}`)
      dispatch({
        type: CHANGE_PASSWORD_FAILURE
      })
    })
}

export const resetPassword = () => (dispatch, getState) => {
  dispatch({
    type: RESET_PASSWORD_PENDING
  })
  const state = getState()
  const email = _.get(state, 'settings.system.settings.email')
  settingsService.resetPassword(email)
    .then(() => {
      dispatch({
        type: RESET_PASSWORD_SUCCESS
      })
    })
    .catch(err => {
      const message = _.get(err, 'response.data.result.content') || err.message
      Alert.error(`Failed to reset password: ${message}`)
      dispatch({
        type: RESET_PASSWORD_FAILURE
      })
    })
}

export const getNotificationSettings = () => (dispatch) => {
  dispatch({
    type: GET_NOTIFICATION_SETTINGS_PENDING
  })

  settingsService.getNotificationSettings().then(data => {
    dispatch({
      type: GET_NOTIFICATION_SETTINGS_SUCCESS,
      payload: { data }
    })
  }).catch(err => {
    Alert.error(`Failed to get notification settings. ${err.message}`)
    dispatch({
      type: GET_NOTIFICATION_SETTINGS_FAILURE
    })
  })
}

export const saveNotificationSettings = (data) => (dispatch) => {
  dispatch({
    type: SAVE_NOTIFICATION_SETTINGS_PENDING
  })

  settingsService.saveNotificationSettings(data).then(() => {
    Alert.success('Settings successfully saved.')
    dispatch({
      type: SAVE_NOTIFICATION_SETTINGS_SUCCESS,
      payload: { data }
    })
  }).catch(err => {
    Alert.error(`Failed to save settings. ${err.message}`)
    dispatch({
      type: SAVE_NOTIFICATION_SETTINGS_FAILURE,
      payload: { data }
    })
  })
}

export const saveProfileSettings = (settings) => (dispatch, getState) => {
  dispatch({
    type: SAVE_PROFILE_SETTINGS_PENDING
  })

  const state = getState()
  const handle = _.get(state, 'loadUser.user.handle')
  const traits = _.get(state, 'settings.profile.traits')

  const updatedTraits = applyProfileSettingsToTraits(traits, settings)

  memberService.updateMemberTraits(handle, updatedTraits)
    // TODO, now we don't update store with the data from server as backend returns wrong
    // data when we update see https://github.com/appirio-tech/ap-member-microservice/issues/165.
    // So we update the store with the data we sent to the server.
    .then(() => _.cloneDeep(updatedTraits))
    .then((data) => {
      Alert.success('Settings successfully saved.')
      dispatch({
        type: SAVE_PROFILE_SETTINGS_SUCCESS,
        payload: { data }
      })
    })
    .catch((err) => {
      Alert.error(`Failed to save settings. ${err.message}`)
      dispatch({
        type: SAVE_PROFILE_SETTINGS_FAILURE
      })
    })
}

export const getProfileSettings = () => (dispatch, getState) => {
  dispatch({
    type: GET_PROFILE_SETTINGS_PENDING
  })

  const state = getState()
  const handle = _.get(state, 'loadUser.user.handle')

  memberService.getMemberTraits(handle).then(data => {
    dispatch({
      type: GET_PROFILE_SETTINGS_SUCCESS,
      payload: { data }
    })
  }).catch((err) => {
    Alert.error(`Failed to get settings. ${err.message}`)
    dispatch({
      type: GET_PROFILE_SETTINGS_FAILURE,
    })
  })
}

export const uploadProfilePhoto = (file) => (dispatch, getState) => {
  dispatch({
    type: SAVE_PROFILE_PHOTO_PENDING
  })

  const state = getState()
  const handle = _.get(state, 'loadUser.user.handle')

  memberService.getPreSignedUrl(handle, file)
    .then(({ preSignedURL, token }) => {
      return uploadFileToS3(preSignedURL, file)
        .then(() => memberService.updateMemberPhoto(handle, {
          contentType: file.type,
          token,
        }))
    }).then(photoUrl => {
      Alert.success('Profile photo uploaded successfully')
      dispatch({
        type: SAVE_PROFILE_PHOTO_SUCCESS,
        payload: { photoUrl }
      })
    }).catch(err => {
      Alert.error(`Failed to upload photo. ${err.message}`)
      dispatch({
        type: SAVE_PROFILE_PHOTO_FAILURE,
      })
    })
}
