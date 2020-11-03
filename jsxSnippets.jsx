import React,{Component} from "react";
import logger from "sabio-debug";
import * as faqService from "../../services/faqService";
import {Field,Formik,ErrorMessage} from "formik";
import PropTypes from "prop-types";
import "./faq.module.css";
import {Form,FormGroup,Label} from "reactstrap";
import faqSchema from "./faqValidatorSchema";
import {toast} from "react-toastify";
import styles from "./faq.module.css";
import {Row,Button} from "react-bootstrap";
const _logger=logger.extend("FaqForm");
class FaqForm extends Component
{
	state={
		formData: {
			question: "",
			answer: "",
			categoryId: 0,
		},
		faqCategories: [],
		mappedFaqCategories: [],
	};

	componentDidMount()
	{
		this.requestAllFaqCategories(this.state.faqCategories);
		this.propsToFormData();
	}

	requestAllFaqCategories=(faqCategories) =>
	{
		faqService
			.getAllFaqCategories(faqCategories)
			.then(this.onGetFaqCategoriesSuccess)
			.catch(this.onGetFaqCategoriesError);
	};

	propsToFormData()
	{
		_logger("form")
		if(this.props.match.params&&this.props.match.params.id)
		{
			let faqIdentifier=this.props.location.state.payload;
			this.setState(() =>
			{
				return ({
					formData: {
						question: faqIdentifier.question,
						answer: faqIdentifier.answer,
						categoryId: faqIdentifier.categoryId,
					},
				});
			});
		} else
		{
			return {
				formData: {
					question: "",
					answer: "",
					categoryId: 0,
				},
			};
		}
	};

	onGetFaqCategoriesSuccess=(response) =>
	{
		let faqCategories=response.items;
		this.setState(() =>
		{
			return {
				mappedFaqCategories: faqCategories.map(this.mapCat),
				faqCategories,
			};
		});
	};

	mapCat=(cat) => (
		<option key={cat.id} value={cat.id}>
			{cat.name}
		</option>
	);

	handleSubmit=(values,{resetForm}) =>
	{
		resetForm(this.state.formData)
		values.categoryId=parseInt(values.categoryId);
		const faqDataUpdated={
			question: values.question,
			answer: values.answer,
			categoryId: values.categoryId,
		};
		if(this.props.match.params.id)
		{
			faqService
				.updateFAQ(faqDataUpdated,this.props.match.params.id)
				.then(this.onPostSuccess)
				.catch(this.onPostError);
		} else
		{
			faqService
				.postFaq(values)
				.then(this.onPostSuccess)
				.catch(this.onPostError);
		}
	};

	onGetFaqCategoriesError=() =>
	{
		toast.error("Failed to retrieve information!");
	}

	onPostSuccess=() =>
	{
		toast.success("Success!");
		this.props.history.push("/faq");
	};

	onPostError=() =>
	{
		toast.error("Failed to submit new information!");
	};

	render()
	{
		return (
			<>
				<Formik
					enableReinitialize={true}
					validationSchema={faqSchema}
					initialValues={this.state.formData}
					onSubmit={this.handleSubmit}>
					{(props) =>
					{
						const {values,handleSubmit,isValid,isSubmitting}=props;
						return (
							<div>
								<Form
									onSubmit={handleSubmit}
									className={`${styles.formContainer}`}>
									<FormGroup
										style={{justifyContent: ""}}>
										<FormGroup>
											<Label for="exampleSelect">
												<h3>
													Topic
                        </h3>
											</Label>
											<Field
												component="select"
												type="number"
												className="form-control"
												name="categoryId">
												<option values={values.categoryId}>
													Select A Category
                      </option>
												{this.state.mappedFaqCategories}
											</Field>
										</FormGroup>
										<Row
											style={{marginLeft: 20}}>
											<Label><h3>Questions :</h3></Label>
											<div className="row form-group">
												<div className="col-lg-10">
													<Field
														name="question"
														type="text"
														as="textarea"
														values={values.question}
														placeholder="200 characters max">
													</Field>
													<ErrorMessage
														component="span"
														name="question"
														className={styles.errorMessage} />
												</div>
											</div>
										</Row>
									</FormGroup>
									<FormGroup>
										<Row
											style={{marginLeft: 40}}>
											<Label><h3>Answer : </h3></Label>
											<div>
												<Field
													name="answer"
													type="text"
													as="textarea"
													rows="3"
													values={values.answer}
												></Field>
												<ErrorMessage
													component="span"
													name="answer"
													className={styles.errorMessage} />
											</div>
										</Row>
									</FormGroup>
									<Button
										size="lg"
										variant="success"
										type="submit"
										disabled={!isValid||isSubmitting}>
										{this.props.match.params.id? "Update":"Submit"}
									</Button>
								</Form>
							</div>
						);
					}}
				</Formik>
			</>
		);
	}
}

FaqForm.propTypes={
	match: PropTypes.shape({
		params: PropTypes.shape({
			id: PropTypes.string,
		}),
	}),
	location: PropTypes.shape({
		state: PropTypes.shape({
			payload: PropTypes.shape({
				id: PropTypes.number,
				question: PropTypes.string,
				answer: PropTypes.string,
				categoryId: PropTypes.number,
			}),
		}),
	}),
	history: PropTypes.shape({
		push: PropTypes.func,
	}),
};

export default FaqForm;
