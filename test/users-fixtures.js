function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'sam.gamgee@shire.com',
      password: 'secret'
    },
    {
      id: 2,
      user_name: 'peregrin.took@shire.com',
      password: 'secret'
    }
  ]
}

function userRegObject() {
  return {
    id: 1,
    user_name: 'sam.gamgee@shire.com',
    password: 'secret'
  }
}

function makeMaliciousUser() {
  const maliciousUser = {
    id: 5,
    user_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedUser = {
    ...maliciousUser,
    user_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousUser,
    expectedUser
  }
}
module.exports = {
  makeUsersArray,
  userRegObject,
  makeMaliciousUser
}