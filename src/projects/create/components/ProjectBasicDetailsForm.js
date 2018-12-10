import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import update from 'react-addons-update'
import FormsyForm from 'appirio-tech-react-components/components/Formsy'
const Formsy = FormsyForm.Formsy
import './ProjectBasicDetailsForm.scss'

import SpecSection from '../../detail/components/SpecSection'

class ProjectBasicDetailsForm extends Component {

  constructor(props) {
    super(props)
    this.enableButton = this.enableButton.bind(this)
    this.disableButton = this.disableButton.bind(this)
    this.submit = this.submit.bind(this)
    this.handleChange = this.handleChange.bind(this)
    // this.readyToSubmit = this.readyToSubmit.bind(this)
    this.renderNextSection = this.renderNextSection.bind(this)
    this.state = {
      enableSubmit : false,
      currentSection: 0,
      isLastSection: false,
      projectFormData : {}
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(
      _.isEqual(nextProps.project, this.props.project)
     && _.isEqual(nextState.project, this.state.project)
     && _.isEqual(nextState.canSubmit, this.state.canSubmit)
     && _.isEqual(nextProps.sections, this.props.sections)
     && _.isEqual(nextState.isSaving, this.state.isSaving)
     && _.isEqual(nextState.enableSubmit, this.state.enableSubmit)
     && _.isEqual(nextState.projectFormData, this.state.projectFormData)
     && _.isEqual(nextState.currentSection, this.state.currentSection)
    )
  }

  componentWillMount() {
    this.setState({
      project: Object.assign({}, this.props.project),
      canSubmit: false
    })
  }

  componentWillReceiveProps(nextProps) {
    // we receipt property updates from PROJECT_DIRTY REDUX state
    if (nextProps.project.isDirty) return
    const updatedProject = Object.assign({}, nextProps.project)
    this.setState({
      project: updatedProject,
      isSaving: false,
      canSubmit: false
    })
  }

  isChanged() {
    // We check if this.refs.form exists because this may be called before the
    // first render, in which case it will be undefined.
    return (this.refs.form && this.refs.form.isChanged())
  }

  enableButton() {
    this.setState( { canSubmit: true })
  }

  disableButton() {
    this.setState({ canSubmit: false })
  }

  submit(model) {
    console.log('submit', this.isChanged())
    this.setState({isSaving: true })
    this.props.submitHandler(model)
  }

  renderNextSection() {
    const { template } = this.props
    const { currentSection } = this.state
    let newSection = currentSection
    if (currentSection < template.sections.length - 1) {
      newSection = currentSection + 1
      this.setState({
        currentSection : newSection,
        isLastSection : newSection === template.sections.length - 1
      })
    } else {
      // do nothing, unless there is only one question to be rendered in the last section
    }
  }

  /**
   * Handles the change event of the form.
   *
   * @param change changed form model in flattened form
   * @param isChanged flag that indicates if form actually changed from initial model values
   */
  handleChange(change) {
    // removed check for isChanged argument to fire the PROJECT_DIRTY event for every change in the form
    // this.props.fireProjectDirty(change)
    console.log('change : ', change)
    this.setState({projectFormData : update(this.state.projectFormData, { $merge : change })})
    this.props.onProjectChange(change)
  }


  render() {
    console.log('Rendering ProjectBasicDetailsForm')
    const { isEditable, template, submitBtnText } = this.props
    const { project, canSubmit, currentSection, isLastSection } = this.state
    // const submitButtonText = enableSubmit ? submitBtnText : 'Next Section - A'
    // const submitButtonType = enableSubmit ? 'submit' : 'button'
    // const submitOnClick = enableSubmit ? () => {} : this.renderNextSection
    const renderSection = (section, idx) => {
      return (
        <div key={idx} className="ProjectBasicDetailsForm">
          <div className="sections">
            <SpecSection
              {...section}
              // currentSubSection={0}
              project={project}
              sectionNumber={idx + 1}
              showFeaturesDialog={ () => {} }//dummy
              resetFeatures={ () => {} }//dummy
              // TODO we shoudl not update the props (section is coming from props)
              // further, it is not used for this component as we are not rendering spec screen section here
              validate={() => {}}//dummy
              isCreation
              onSectionComplete={this.renderNextSection}
              projectFormData={this.state.projectFormData}
              isLastSection={ isLastSection }
            />
          </div>
        </div>
      )
    }

    return (
      <div>
        <Formsy.Form
          ref="form"
          disabled={!isEditable}
          onInvalid={this.disableButton}
          onValid={this.enableButton}
          onValidSubmit={this.submit}
          onChange={ this.handleChange }
        >
          { template.wizard ? renderSection(template.sections[currentSection], currentSection) : template.sections.map(renderSection)}

          { (isLastSection || !template.wizard) && <div className="section-footer section-footer-spec">
            <button className="tc-btn tc-btn-primary tc-btn-md"
              type='submit'
              disabled={(this.state.isSaving) || !canSubmit}
            >{ submitBtnText }</button>
          </div>}
        </Formsy.Form>
      </div>
    )
  }
}

ProjectBasicDetailsForm.propTypes = {
  project: PropTypes.object.isRequired,
  saving: PropTypes.bool.isRequired,
  template: PropTypes.object.isRequired,
  isEditable: PropTypes.bool.isRequired,
  submitHandler: PropTypes.func.isRequired
}

export default ProjectBasicDetailsForm
