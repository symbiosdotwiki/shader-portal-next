import fs from 'fs'
import path from 'path'

const shaderExts = ['.glsl', '.fs', '.vs', '.vert', '.frag']
const imgExts = ['.jpg', '.png']

// import Image from 'next/image'

// const tttt = require('@/shaders/feedback/random.fs')

const throughDirectory = (directory, exts, allFiles) => {
  fs.readdirSync(directory).forEach(file => {
    const absPath = path.join(directory, file)
    if (fs.statSync(absPath).isDirectory()) 
      return throughDirectory(absPath, exts, allFiles)
    else if(exts.includes(path.extname(absPath))){
      return allFiles.push(absPath)
    }
  })
}

const extractData = (file) => {
  const isImg = imgExts.includes(path.extname(file))
  const base = isImg ? 'base64' : 'utf8'
  const relPath = file.replace(process.cwd(), '').replace('/src', '').replace('/public', '')

  const content = isImg ? relPath : fs.readFileSync(file, base)

  const filename = file.replace(/^.*[\\\/]/, '')
  return ([filename, content])
}


export function getAllFiles(dir, exts) {
  let filenames  = []
	const fPath = path.join(process.cwd(), dir)
	throughDirectory(fPath, exts, filenames)
  let files = Object.fromEntries(
    filenames.map(file => extractData(file))
  )
  return files
}

export function getAllShaders() {
  return getAllFiles('/src/app/shaders', shaderExts)
}

export function getAllImages() {
  return getAllFiles('/public/media/tex', imgExts)
}

export function getAllData() {
  return {
    'shaders' : getAllShaders(),
    'imgs' : getAllImages()
  }
}