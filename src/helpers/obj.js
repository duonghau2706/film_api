function cleanObj(obj) {
  const newObj = { ...obj }
  for (let propName in newObj) {
    if (newObj[propName] === null || newObj[propName] === undefined) {
      delete newObj[propName]
    }
  }
  return newObj
}

export { cleanObj }
