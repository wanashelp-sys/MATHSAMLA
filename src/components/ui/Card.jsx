import React from 'react'

export function Card({ className = '', title, children, actions }){
  return (
    <article className={"card " + className}>
      {title && (
        <header className="card-header">
          <h3 className="card-title">{title}</h3>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      <div className="card-body">{children}</div>
    </article>
  )
}

export default Card
