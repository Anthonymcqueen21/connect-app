import React from 'react'
import Layout from '../Layout/Layout'

require('./App.scss')

const App = (props) => {
  return (
    <Layout {...props}>
      { props.children }
    </Layout>
  )
}

export const renderApp = (topbar, content, hideFooter=false) => () => (
  <App {...{topbar, content, hideFooter}} />
)

export default App
