import React, {Component} from 'react'
import PropTypes from 'prop-types'
import seeAttachedWrapperField from './SeeAttachedWrapperField'
import FormsyForm from 'appirio-tech-react-components/components/Formsy'
const TCFormFields = FormsyForm.Fields
import _ from 'lodash'

import SpecQuestionList from './SpecQuestionList/SpecQuestionList'
import SpecQuestionIcons from './SpecQuestionList/SpecQuestionIcons'
import SpecFeatureQuestion from './SpecFeatureQuestion'
import ColorSelector from './../../../components/ColorSelector/ColorSelector'
import SelectDropdown from './../../../components/SelectDropdown/SelectDropdown'
import {evaluate} from './../../../helpers/dependentQuestionsHelper.js'

// HOC for TextareaInput
const SeeAttachedTextareaInput = seeAttachedWrapperField(TCFormFields.Textarea)

// HOC for SpecFeatureQuestion
const SeeAttachedSpecFeatureQuestion = seeAttachedWrapperField(SpecFeatureQuestion, [])

const getIcon = icon => {
  switch (icon) {
  case 'feature-generic':
    return <SpecQuestionIcons.Generic />
  case 'question':
    return <SpecQuestionIcons.Question />
  case 'feature-placeholder':
  default:
    return <SpecQuestionIcons.Placeholder />
  }
}

// { isRequired, represents the overall questions section's compulsion, is also available}
class SpecQuestionsProjectCreation extends Component {

  constructor(props) {
    super(props)
    this.renderNextQuestion = this.renderNextQuestion.bind(this)
    this.state = {
      questions : [],
      questionsRendered : [],
      questionIndex : 0,
      hideNextQuestionButton : false,
      formData: {}
    }
  }

  componentWillMount() {
    this.props.toggleSectionNext()
    this.setState({
      questions : this.props.questions,
      questionsRendered : [...this.state.questionsRendered, this.props.questions[this.state.questionIndex]]
    })
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      formData : nextProps.formData
    })
  }

  renderNextQuestion() {
    const renderedData = this.state.formData
    //Rendering next question
    let nextQuestionIndex = this.state.questionIndex + 1
    if(this.state.questions.length > nextQuestionIndex) {
      const nextQuestion = this.props.questions[nextQuestionIndex]
      if(!nextQuestion.dependent) {
        this.setState({
          questionIndex : nextQuestionIndex,
          questionsRendered : [...this.state.questionsRendered, this.props.questions[nextQuestionIndex]]
        })
      }else if(nextQuestion.dependent && evaluate(nextQuestion.condition, renderedData)) {
        this.setState({
          questionIndex : nextQuestionIndex,
          questionsRendered : [...this.state.questionsRendered, this.props.questions[nextQuestionIndex]]
        })
      } else {
        nextQuestionIndex++
        while(this.state.questions.length > nextQuestionIndex) {
          const nextQuestion = this.props.questions[nextQuestionIndex]
          if(!nextQuestion.dependent || (nextQuestion.dependent && evaluate(nextQuestion.condition, renderedData))) {
            this.setState({
              questionIndex : nextQuestionIndex,
              questionsRendered : [...this.state.questionsRendered, nextQuestion]
            })
            break
          }
          nextQuestionIndex++
        }
        /*this.setState({
          questionIndex : nextQuestionIndex
        })*/
      }
    }
    //After rendering last question
    if(this.state.questions.length === nextQuestionIndex) {
      this.setState({
        hideNextQuestionButton : true
      })
      this.props.toggleSectionNext()
      this.props.renderNextSubSection()
    }
  }

  render() {

    const { project, dirtyProject, resetFeatures, showFeaturesDialog, showHidden } = this.props
    const { questionsRendered } = this.state
    const renderQ = (q, index) => {
      // let child = null
      // const value =
      const elemProps = {
        name: q.fieldName,
        label: q.label,
        value: _.unescape(_.get(project, q.fieldName, '')),
        required: q.required,
        validations: q.required ? 'isRequired' : null,
        validationError: q.validationError,
        validationErrors: q.validationErrors
      }
      if (q.fieldName === 'details.appDefinition.numberScreens') {
        const p = dirtyProject ? dirtyProject : project
        const screens = _.get(p, 'details.appScreens.screens', [])
        const definedScreens = screens.length
        _.each(q.options, (option) => {
          let maxValue = 0
          const hyphenIdx = option.value.indexOf('-')
          if (hyphenIdx === -1) {
            maxValue = parseInt(option.value)
          } else {
            maxValue = parseInt(option.value.substring(hyphenIdx+1))
          }
          option.disabled = maxValue < definedScreens
          option.errorMessage = (
            <p>
              You've defined more than {option.value} screens.
              <br/>
              Please delete screens to select this option.
            </p>
          )
        })
      }

      let ChildElem = ''
      switch (q.type) {
      case 'see-attached-textbox':
        ChildElem = SeeAttachedTextareaInput
        elemProps.wrapperClass = 'row'
        elemProps.autoResize = true
        elemProps.description = q.description
        elemProps.hideDescription = true
        // child = <SeeAttachedTextareaInput name={q.fieldName} label={q.label} value={value} wrapperClass="row" />
        break
      case 'textinput':
        ChildElem = TCFormFields.TextInput
        elemProps.wrapperClass = 'row'
        // child = <TCFormFields.TextInput name={q.fieldName} label={q.label} value={value} wrapperClass="row" />
        break
      case 'numberinput':
        ChildElem = TCFormFields.TextInput
        elemProps.wrapperClass = 'row'
        elemProps.type = 'number'
        break
      case 'numberinputpositive':
        ChildElem = TCFormFields.TextInput
        elemProps.wrapperClass = 'rowchut'
        elemProps.type = 'number'
        elemProps.minValue = 0
        break
      case 'textbox':
        ChildElem = TCFormFields.Textarea
        elemProps.wrapperClass = 'row'
        elemProps.autoResize = true
        if (q.validations) {
          elemProps.validations = q.validations
        }
        // child = <TCFormFields.Textarea name={q.fieldName} label={q.label} value={value} wrapperClass="row" />
        break
      case 'radio-group':
        ChildElem = TCFormFields.RadioGroup
        _.assign(elemProps, {wrapperClass: 'row', options: q.options})
        // child = <TCFormFields.RadioGroup name={q.fieldName} label={q.label} value={value} wrapperClass="row" options={q.options} />
        break
      case 'tiled-radio-group':
        ChildElem = TCFormFields.TiledRadioGroup
        _.assign(elemProps, {wrapperClass: 'row', options: q.options, theme: 'dark', tabable: true})
        // child = <TCFormFields.TiledRadioGroup name={q.fieldName} label={q.label} value={value} wrapperClass="row" options={q.options} />
        break
      case 'see-attached-tiled-radio-group':
        ChildElem = TCFormFields.TiledRadioGroup
        _.assign(elemProps, {wrapperClass: 'row', options: q.options, hideDescription: true, description: q.description})
        // child = <TCFormFields.TiledRadioGroup name={q.fieldName} label={q.label} value={value} wrapperClass="row" options={q.options} />
        break
      case 'checkbox-group':
        ChildElem = TCFormFields.CheckboxGroup
        _.assign(elemProps, {options: q.options})
        // child = <TCFormFields.CheckboxGroup name={q.fieldName} label={q.label} value={value} options={q.options} />
        break
      case 'checkbox':
        ChildElem = TCFormFields.Checkbox
        // child = <TCFormFields.Checkbox name={q.fieldName} label={q.label} value={value} />
        break
      case 'see-attached-features':
        ChildElem = SeeAttachedSpecFeatureQuestion
        _.assign(elemProps, {
          resetValue: resetFeatures,
          question: q, showFeaturesDialog,
          hideDescription: true,
          description: q.description
        })
        // child = <SeeAttachedSpecFeatureQuestion name={q.fieldName} value={value} question={q} resetValue={resetFeatures} showFeaturesDialog={showFeaturesDialog} />
        break
      case 'colors':
        ChildElem = ColorSelector
        _.assign(elemProps, { defaultColors: q.defaultColors })
        // child = <ColorSelector name={q.fieldName} defaultColors={q.defaultColors} value={value} />
        break
      case 'select-dropdown':
        ChildElem = SelectDropdown
        _.assign(elemProps, {
          options: q.options,
          theme: 'default'
        })
        break
      case 'slide-radiogroup':
        ChildElem = TCFormFields.SliderRadioGroup
        _.assign(elemProps, {
          options: q.options,
          min: 0,
          max: q.options.length - 1,
          step: 1,
          included: false
        })
        break
      default:
        ChildElem = <noscript />
      }
      return (
        <SpecQuestionList.Item
          key={index}
          title={q.title}
          icon={getIcon(q.icon)}
          description={q.description}
          required={q.required || (q.validations && q.validations.indexOf('isRequired') !== -1)}
          hideDescription={elemProps.hideDescription}
        >
          <ChildElem {...elemProps} />
        </SpecQuestionList.Item>
      )
    }

    return (
      <div>
        <SpecQuestionList>
          {questionsRendered.filter((question) => showHidden || !question.hidden).map(renderQ)}
        </SpecQuestionList>
        {!this.state.hideNextQuestionButton && <div className="section-footer section-footer-spec">
          <button className="tc-btn tc-btn-primary tc-btn-md" type="button" onClick={this.renderNextQuestion} >Next</button>
        </div>}
      </div>
    )
  }
}

SpecQuestionsProjectCreation.propTypes = {
  /**
   * Original project object for which questions are to be rendered
   */
  project: PropTypes.object.isRequired,
  /**
   * Dirty project with all unsaved changes
   */
  dirtyProject: PropTypes.object,
  /**
   * Callback to be called when user clicks on Add/Edit Features button in feature picker component
   */
  showFeaturesDialog: PropTypes.func.isRequired,
  /**
   * Call back to be called when user resets features from feature picker.
   * NOTE: It seems it is not used as of now by feature picker component
   */
  resetFeatures: PropTypes.func.isRequired,
  /**
   * Array of questions to be rendered. This comes from the spec template for the product
   */
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  /**
   * If true, then `hidden` property of questions will be ignored and hidden questions will be rendered
   */
  showHidden: PropTypes.bool,
  /**
   * toggles the visibility of section's Next button
   */
  toggleSectionNext: PropTypes.func.isRequired,
  renderNextSubSection: PropTypes.func.isRequired,
  formData: PropTypes.object,
}

export default SpecQuestionsProjectCreation
