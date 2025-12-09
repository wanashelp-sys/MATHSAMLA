#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const SRC = path.resolve(__dirname, '..', 'src')
const ALLOWED = new Set(['#F5F5F5','#F8E7F6','#DD88CF','#4B164C','#f5f5f5','#f8e7f6','#dd88cf','#4b164c'])

function walk(dir, exts){
  const files = []
  for(const name of fs.readdirSync(dir)){
    const full = path.join(dir,name)
    const stat = fs.statSync(full)
    if(stat.isDirectory()) files.push(...walk(full, exts))
    else if(exts.some(e => full.endsWith(e))) files.push(full)
  }
  return files
}

function hexToRgb(hex){
  hex = hex.replace('#','')
  if(hex.length===3) hex = hex.split('').map(s=>s+s).join('')
  const n = parseInt(hex,16)
  return [(n>>16)&255, (n>>8)&255, n&255]
}

function luminance([r,g,b]){
  const srgb = [r,g,b].map(v=>v/255).map(v=> v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4))
  return 0.2126*srgb[0]+0.7152*srgb[1]+0.0722*srgb[2]
}

function mapHexToVar(hex){
  const full = hex.length===4 ? '#' + hex.slice(1).split('').map(c=>c+c).join('') : hex
  if(ALLOWED.has(full) || ALLOWED.has(full.toLowerCase())) return full
  try{
    const rgb = hexToRgb(full)
    const lum = luminance(rgb)
    if(lum > 0.75) return 'var(--color-bg-page)'
    if(lum < 0.35) return 'var(--color-primary)'
    return 'var(--color-accent)'
  }catch(e){
    return 'var(--color-primary)'
  }
}

function replaceInFile(file){
  let content = fs.readFileSync(file,'utf8')
  const original = content

  // Replace hex color tokens in JS/JSX/TSX strings, props, inline styles and SVG attributes
  content = content.replace(/#([0-9a-fA-F]{3,6})\b/g, (m)=> mapHexToVar(m))

  if(content !== original){
    fs.writeFileSync(file, content, 'utf8')
    console.log('Updated', path.relative(process.cwd(), file))
  }
}

const exts = ['.js','.jsx','.ts','.tsx','.svg']
const files = walk(SRC, exts)
files.forEach(replaceInFile)
console.log('Inline color replacement complete. Scanned files:', files.length)
