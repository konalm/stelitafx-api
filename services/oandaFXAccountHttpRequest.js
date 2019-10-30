const axios = require('axios')

const token = '8b69239f0dbc7b823b761ec7cf12a9bb-f0d0168e117e760969d38baf7285bccb'
const authHeader = `Bearer ${token}`
const url = 'https://api-fxpractice.oanda.com/v3/'

const headers = {Authorization: authHeader}


const httpRequest = (method, path, payload = null) =>  (path, payload = null) => 
  new Promise((resolve) => 
{
  const request = {
    method,
    headers,
    url: url + path,
    data: payload
  }

  axios(request)
    .then(res => {
      resolve(res.data)
    })
    .catch(err => {
      console.error(err)
    })
})

exports.get = httpRequest('get')
exports.update = httpRequest('put')