#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const SRC = path.resolve(__dirname, '..', 'src')
const ALLOWED = new Set(['#F5F5F5','#F8E7F6','#DD88CF','#4B164C','#f5f5f5','#f8e7f6','#dd88cf','#4b164c'])

function walk(dir){
  const files = []
  for(const name of fs.readdirSync(dir)){
    const full = path.join(dir,name)
    const stat = fs.statSync(full)
    if(stat.isDirectory()) files.push(...walk(full))
    else if(/\.css$/.test(name)) files.push(full)
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

function replaceInFile(file){
  let content = fs.readFileSync(file,'utf8')
  let original = content

  // Remove gradient backgrounds: replace background: ...gradient...; with background: var(--color-bg-card);
  content = content.replace(/background\s*:\s*[^;]*gradient[^;]*;/gi, 'background: var(--color-bg-card);')
  content = content.replace(/background\s*:\s*radial-gradient\([^;]*\);/gi, 'background: var(--color-bg-card);')

  // Replace white hex with page bg
  content = content.replace(/#fff\b/gi, 'var(--color-bg-page)')
  content = content.replace(/#ffffff\b/gi,'var(--color-bg-page)')

  // Replace other hex colors heuristically
  content = content.replace(/#([0-9a-fA-F]{3,6})\b/g, function(m,hex){
    const full = m.length===4 ? '#' + hex.split('').map(c=>c+c).join('') : m
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
  })

  if(content !== original){
    fs.writeFileSync(file, content, 'utf8')
    console.log('Updated', path.relative(process.cwd(), file))
  }
}

const files = walk(SRC)
files.forEach(replaceInFile)
console.log('Normalization complete. Scanned files:', files.length)
