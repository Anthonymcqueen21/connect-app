import React from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
require('./SpecQuestionList.scss')

const SpecQuestionList = ({ children }) => {
  return (
    <div className="spec-question-list">
      { children }
    </div>
  )
}

SpecQuestionList.propTypes = {
  children: PropTypes.any.isRequired
}

const SpecQuestionListItem = ({icon, title, description, children, required, hideDescription}) => (
  <div className="spec-question-list-item">
    {icon && <div className="icon-col">{icon}</div>}
    <div className="content-col">
      <h5>{title}{required ? <span>*</span> : null}</h5>
      {children && <div className="child-component">{children}</div>}
      {!hideDescription && <p className={cn({bigger: !icon})}>{description}</p>}
    </div>
  </div>
)

SpecQuestionListItem.propTypes = {
  icon: PropTypes.any,
  title: PropTypes.any.isRequired,
  description: PropTypes.any,
  children: PropTypes.any
}

SpecQuestionList.Item = SpecQuestionListItem

export default SpecQuestionList
