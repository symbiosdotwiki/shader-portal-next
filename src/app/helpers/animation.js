export var afn = {
  'const': function(v1) {
    return v1
  },
  'linear': function(v1, v2, t1, t2) {
    return (time) => {
      if(time < t1){
        return v1
      }
      else if(time > t2){
        return v2
      }
      return (time - t1) * (v2-v1)/(t2-t1) + v1
    }
  },
  'mono': function(v1, v2, t1, t2) {
    return (time) => {
      return (time - t1) * (v2-v1)/(t2-t1) + v1
    }
  }, 
  'ease-in': function(v1, v2, t1, t2) {
    return (time) => {
      if(time < t1){
        return v1
      }
      else if(time > t2){
        return v2
      }
      return Math.sin(Math.PI/2 * (time-t1)/(t2-t1) ) * (v2-v1) + v1
    }
  }, 
  'ease-out': function(v1, v2, t1, t2) {
    return (time) => {
      if(time < t1){
        return v1
      }
      else if(time > t2){
        return v2
      }
      return (1 - Math.cos(Math.PI/2 * (time-t1)/(t2-t1) )) * (v2-v1) + v1
    }
  }, 
  'ease-in-out': function(v1, v2, t1, t2) {
    return (time) => {
      if(time < t1){
        return v1
      }
      else if(time > t2){
        return v2
      }
      return (1 + Math.cos(Math.PI * ( (time-t1)/(t2-t1) + 1) ) )/2 * (v2-v1) + v1
    }
  },
  'cosine': function(v1, v2, t1, t2) {
    return (time) => {
      return (1 + Math.cos(Math.PI * ( (time-t1)/(t2-t1) + 1) ) )/2 * (v2-v1) + v1
    }
  },
  'sine': function(v1, v2, t1, t2) {
    return (time) => {
      return (1 + Math.sin(Math.PI * (time-t1)/(t2-t1) ) )/2 * (v2-v1) + v1
    }
  },
  'ellipse': function(v1, v2, t1, t2, phase) {
    return (time) => {
      return [
        v1 * Math.cos(Math.PI * ((time-t1)/(t2-t1) + phase) ),
        v2 * Math.sin(Math.PI * ((time-t1)/(t2-t1) + phase) )
      ]
    }
  },
}

export var minGreater = (arr, cutoff) => {
  let result = arr.map(i => parseFloat(i))
  result = result.filter(val => val > cutoff)
  result.sort(function(a, b){return a-b})
  if(result.length > 0){
    return result[0]
  }
  return -10
}

export var maxLessthan = (arr, cutoff) => {
  let result = arr.map(i => parseFloat(i))
  result = result.filter(val => val < cutoff)
  result.sort(function(a, b){return b-a})
  if(result.length > 0){
    return result[0]
  }
  return -10
}
