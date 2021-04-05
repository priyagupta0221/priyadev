import React, { Component } from "react";
import ModalWindow from "../modal/ModalWindow";
import AuthService from "../AuthService";
import Pagination from "react-js-pagination";
import {
  Button,
  UncontrolledPopover,
  PopoverHeader,
  PopoverBody
} from "reactstrap";
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Switch,
  Link,
  withRouter
} from "react-router-dom";
import Loader from "react-loader-spinner";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];
const Auth = new AuthService();
export default class ManagerWFHRequest extends Component {
  constructor(props) {
    super();

    this.handleShowDecline = this.handleShowDecline.bind(this);
    this.handleChangeReason = this.handleChangeReason.bind(this);
    this.submitComment = this.submitComment.bind(this);
    this.handleShow = this.handleShow.bind(this);
    this.leaveDetails = this.leaveDetails.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      items: [],
      empId: null,
      todos: [],
      dataPerPage: [],
      currentPage: 1,
      todosPerPage: 8,
      showAlert: false,
      alertMessage: "",
      danger: false,
      numbers: [],
      activePage: 1,
      leaveDetails: [],
      loading: true,
      comment: "",
      count: 1,
      searchValue: "",
      searchLeavevalue: "All",
      comment: "",
      commentChat:[]
    };
  }
  showComment=id=>{
    
    this.setState({
      empId: id
    });
    Auth.getWfhComment(id).then(response=>{
      
      console.log(response)
      if(response.status==200){
        this.setState({
          commentChat:response.comment
        })
      }
    })
  }
  cancelComment = () => {
    this.refs.chatRec.value = "";
    this.setState({
      Validate: false,
    })
  };
  handleChange(e) {
    let indexOfFirstTodo = 0;
    var x = e.target.value;
    Auth.searchWFHByName(x).then(response => {
      if (response.status == 200) {
        var item = [];
        var responseItem = [];

        for (var i = 0; i < response.wfh.length; i++) {
          var raisedOn = new Date(response.wfh[i].requested_at)
            .toISOString()
            .substring(0, 10);
          var datestring = raisedOn.split("-");
          var finalRequestDate =
            datestring[2] + "-" + datestring[1] + "-" + datestring[0];

          response.wfh[i].requested_at = finalRequestDate;
          if (this.state.userRole == 'TeamLead') {
            if (response.wfh[i].teamlead_comment[0] === undefined) {
              item.push(response.wfh[i]);
            }
          } else {
            if (response.wfh[i].leave_comment[0] === undefined) {
              item.push(response.wfh[i]);
            }
          }
        }
        responseItem = (item.sort((a, b) => new Date(...a.requested_at.split('-').reverse()) - new Date(...b.requested_at.split('-').reverse()))).reverse();

        this.setState({
          items: responseItem,
          todos: responseItem,
          loading: false
        });

        const { todos, currentPage, todosPerPage } = this.state;
        const indexOfLastTodo = currentPage * todosPerPage;
        if (x != "") {
          indexOfFirstTodo = 0;
        } else {
          indexOfFirstTodo = indexOfLastTodo - todosPerPage;
        }
        // const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
        const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
        var arr = [];
        const renderTodos = currentTodos.map((todo, index) => {
          arr.push(todo);
          return arr;
        });
        this.setState({
          dataPerPage: arr
        });
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(todos.length / todosPerPage); i++) {
          pageNumbers.push(i);
        }
        this.setState({
          numbers: pageNumbers
        });
      }
    });
  }
  leaveDetails = item => {
    this.setState({
      leaveDetails: item.leave_details
    });
  };
  submitComment = event => {
    
    var idTestq = null;
    this.setState({
      show: false
    });
    idTestq = this.state.empId;
    var user = window.localStorage.getItem("id_token");
    if(this.state.userRole=="Manager"){
    Auth.submitWFHManagerComment(idTestq, this.state.comment).then(data => {
      
      if (data.message == "WFH Request updated successfully") {
        this.showComment(idTestq);
        this.refs.chatRec.value="";
        this.setState({
          comment: "",
          Validate: false,
        });
        var listOfLeaves = [];
        listOfLeaves = this.state.dataPerPage;
        for (var i = 0; i < listOfLeaves.length; i++) {
          var obj = listOfLeaves[i];

          if (obj._id == idTestq) {
            this.state.dataPerPage.splice(i, 1);
            this.setState({
              dataPerPage: this.state.dataPerPage
            });
          }
        }
      } else {
        this.setState({
          alertMessage: data.message,
          showAlert: true
        });
        this.setState({
          comment: ""
        });
      }
      setTimeout(() => {
        this.handleAlert();
      }, 4000);
    });
  }
  else if(this.state.userRole=="TeamLead"){
    Auth.submitWFHTeamLeadComment(idTestq, this.refs.chatRec.value).then(data => {
      if (data.message == "WFH Request updated successfully") {
        this.refs.chatRec.value="";
        this.showComment(idTestq);
        this.setState({
          comment: "",
          Validate: false,
        });
        var listOfLeaves = [];
        listOfLeaves = this.state.dataPerPage;
        for (var i = 0; i < listOfLeaves.length; i++) {
          var obj = listOfLeaves[i];

          if (obj._id == idTestq) {
            this.state.dataPerPage.splice(i, 1);
            this.setState({
              dataPerPage: this.state.dataPerPage
            });
          }
        }
      } else {
        this.setState({
          alertMessage: data.message,
          showAlert: true
        });
       
      }
      setTimeout(() => {
        this.handleAlert();
      }, 4000);
    });
  }
  };

  apiResponse(data) {
    if (data.message == "Success") {
      this.setState({
        showAlert: true,
        alertMessage: "Successfully inserted comment"
      });
      setTimeout(() => {
        this.setState({ alertMessage: "", showAlert: false });
      }, 4000);
      alert("successfully inserted comment");
    } else {
    }
  }
  handleChangeReason(event) {
    this.setState({
      comment: event.target.value
    });
    if (event.target.value.trim().length === 0) {
      this.setState({
        Validate: false
      });
    } else {
      this.setState({
        Validate: true
      });
    }
  }
  handleAlert = () => {
    this.setState({ showAlert: false, danger: false, alertMessage: "" });
  };
  componentDidMount() {
  var dashNotwfh = document.getElementById("dashNotwfhrequest");
  dashNotwfh.classList.add("active");
    var token = window.localStorage.getItem("id_token");
    Auth.getUserData(token).then(response => {

      this.setState({
        userRole: response.user.role,
        data: response.user
      });
    });
    var responseItem = [];
    Auth.getWfhStatus().then(response => {
        
      if (response.wfh != undefined) {
        var item = [];
        for (var i = 0; i < response.wfh.length; i++) {
            var raisedOn = new Date(response.wfh[i].requested_at)
            .toISOString()
            .substring(0, 10);
          var datestring = raisedOn.split("-");
          var finalRequestDate =
            datestring[2] + "-" + datestring[1] + "-" + datestring[0];
            response.wfh[i].requested_at = finalRequestDate;
          if (response.wfh[i].approved_by.length > 0) {
            for (var j = 0; j < response.wfh[i].approved_by.length; j++) {
              if (response.wfh[i].approved_by[j] == "Admin") {
                response.wfh[i].message = "Approved By HR";
              } else if (response.wfh[i].approved_by[j] == "SuperAdmin") {
                response.wfh[i].message = "Approved By Delivery Head";
              }
            }
          }
          if (this.state.userRole == 'TeamLead') {
            if (response.wfh[i].teamlead_comment[0] === undefined) {
              item.push(response.wfh[i]);
            }
          } else {
            if (response.wfh[i].leave_comment[0] === undefined) {
              item.push(response.wfh[i]);
            }
          }
        }

        responseItem = (item.sort((a, b) => new Date(...a.requested_at.split('-').reverse()) - new Date(...b.requested_at.split('-').reverse()))).reverse();

        this.setState({
          items: responseItem,
          todos: responseItem,
          loading: false
        });
        const { todos, currentPage, todosPerPage } = this.state;
        const indexOfLastTodo = currentPage * todosPerPage;
        const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
        const currentTodos = todos.slice(indexOfFirstTodo, indexOfLastTodo);
        var arr = [];
        const renderTodos = currentTodos.map((todo, index) => {
          arr.push(todo);
          return arr;
        });
        this.setState({
          dataPerPage: arr
        });
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(todos.length / todosPerPage); i++) {
          pageNumbers.push(i);
        }
        this.setState({
          numbers: pageNumbers
        });
      }
    });
  }
  handleShow = id => {
    this.setState({
      empId: id
    });
  };
  handleShowDecline(id) {
    this.setState({
      showDec: true,
      empId: id
    });
  }
  handleClick = number => {
    this.setState({
      activePage: number
    });
      var responseItem = [];
      Auth.getWfhStatus().then(response => {
        var item = [];
        for (var i = 0; i < response.wfh.length; i++) {
          var raisedOn = new Date(response.wfh[i].requested_at)
            .toISOString()
            .substring(0, 10);
          var datestring = raisedOn.split("-");
          var finalRequestDate =
            datestring[2] + "-" + datestring[1] + "-" + datestring[0];

          response.wfh[i].requested_at = finalRequestDate;
          if (response.wfh[i].approved_by.length > 0) {
            for (var j = 0; j < response.wfh[i].approved_by.length; j++) {
              if (response.wfh[i].approved_by[j] == "Admin") {
                response.wfh[i].message = "Approved By HR";
              } else if (response.wfh[i].approved_by[j] == "SuperAdmin") {
                response.wfh[i].message = "Approved By Delivery Head";
              }
              else if (response.wfh[i].approved_by[j] == "HR") {
                response.wfh[i].message = "Approved By HR";
              }
            }
          }
          if (this.state.userRole == 'TeamLead') {
            if (response.wfh[i].teamlead_comment[0] === undefined) {
              item.push(response.wfh[i]);
            }
          } else {
            if (response.wfh[i].leave_comment[0] === undefined) {
              item.push(response.wfh[i]);
            }
          }
        }
        responseItem = (item.sort((a, b) => new Date(...a.requested_at.split('-').reverse()) - new Date(...b.requested_at.split('-').reverse()))).reverse();

        this.setState({
          items: responseItem,
          todos: responseItem
        });
      });
    
    const indexOfLastTodo = number * this.state.todosPerPage;
    const indexOfFirstTodo = indexOfLastTodo - this.state.todosPerPage;
    this.setState({ count: indexOfFirstTodo + 1 });
    const currentTodos = this.state.todos.slice(
      indexOfFirstTodo,
      indexOfLastTodo
    );
    var arr = [];
    const renderTodos = currentTodos.map((todo, index) => {
      arr.push(todo);
      return arr;
    });
    this.setState({
      dataPerPage: arr
    });
  };

  trimReason(e) {
    const res = arguments[0].slice(0, 9);
    return res;
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="loader-align">
          <Loader
            type="ThreeDots"
            color="#00BFFF"
            height={100}
            width={100}
            timeout={3000} //3 secs
          />
        </div>
      );
    } else {
      return (
        <div className="page-content fade-in-up">
          {this.state.showAlert == true ? (
            <div
              //  className="alert alert-success alert-dismissable fade show alertpopup"
              className={this.handleAlertClass()}
            >
              <button
                className="close"
                onClick={this.handleAlert}
                aria-label="Close"
              >
                ×
              </button>
              <strong></strong> {this.state.alertMessage}
            </div>
          ) : (
              ""
            )}
          <div className="modal fade" id="leaveDetails">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h4 className="modal-title">Leave Type</h4>
                  <button type="button" className="close" data-dismiss="modal">
                    &times;
                  </button>
                </div>
                <div className="modal-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th width="91px" className="tb-leave-ty">
                            Date
                          </th>
                          <th>Leave Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.leaveDetails.map(item => (
                          <tr key={item._id}>
                            <td className="tbl-date">{item.leave_date}</td>
                            <td className="tbl-date"> {item.leave_type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
            {/* ChatComment */}
            <div className="modal fade" id="Chatcmt" data-backdrop="static">
        <div className="modal-dialog ">
          <div className="modal-content">
            <div className="modal-header applyleave">
              <h4 className="modal-title applyleave">
                Chat Window
                </h4>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                onClick={this.cancelComment}
              >
                &times;
                </button>
            </div>
            <div className="row chat-window">
 
              <div className="col-sm-12">
                <div className="modal-body chat-background">

                      <section id="tab1">
                      <div className="row">
                        <div className="col-sm-12">
                        {this.state.commentChat.map(item =>
                        <div className="msg_cotainer_send bg-primary">
                                       <span><small>{item.Role}</small></span> <br></br>
                                     <span>{item.Message}</span>                                             
                       </div>   
                       )}
                
                        </div>
                      </div>
                  </section> 
                </div>
                <div className="modal-footer">
                  <div className="input-group">
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Type your text here"
                      ref="chatRec"
                      onChange={this.handleChangeReason}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={this.submitComment}
                    disabled={!this.state.Validate}
                    className="btn btn-primary btn-rounded">
                  <i className="fa fa-paper-plane"></i> 
                   </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          <div className="ibox">
            <div className="ibox-head box-emp-mang">
              <div className="ibox-title">List of WFH Requests</div>
              <div className="navbar-search empSearch  box-emp-search">
                <div className="rel">
                  <span className="search-icon">
                    <i className="ti-search"></i>
                  </span>
                  <input
                    className="form-control"
                    placeholder="Search By Name..."
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              {/* <div className="rel">
                <input className="form-control ml-1" placeholder="Search By Name.." onChange={this.handleChange} />
              </div> */}
            </div>
            <div className="ibox-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th className="tbl-date" width="91px">
                        Start Date
                      </th>
                      <th className="tbl-date" width="91px">
                        End Date
                      </th>
                      <th>Request</th>
                      <th>Days</th>
                      <th>Details</th>
                      <th className="cmt-section">Reason</th>
                      <th className="cmt-section tbl-date">Comment</th>
                      <th className="tbl-date">Leave Type</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.dataPerPage.map((item, index) => (
                      <tr key={item._id}>
                        <td className="tbl-date">{index + this.state.count}</td>
                        <td className="tbl-date">
                          <Link to={`/empProfile/${item.requested_by}`}>
                            {item.person_name}
                          </Link>
                        </td>
                        <td className="tbl-date">{item.start_date}</td>
                        <td className="tbl-date">{item.end_date}</td>
                        <td className="tbl-date">{item.requested_at}</td>
                        <td className="tbl-date">{item.wfh_days}</td>
                        <td className="tbl-date">
                          <button
                            className="btn btn-outline-info"
                            data-toggle="modal"
                            data-target="#leaveDetails"
                            aria-pressed="false"
                            onClick={() => this.leaveDetails(item)}
                          >
                            <i className="fa fa-list list-status"></i>Details
                          </button>
                        </td>
                        {item.reason.length > 10 ? (
                          <td className="cmt-section">
                            <div
                              id={"UncontrolledPopover-" + item._id}
                              className="pointer"
                            >
                              {this.trimReason(item.reason, item._id)}...
                            </div>
                            <UncontrolledPopover
                              trigger="legacy"
                              placement="bottom"
                              target={"UncontrolledPopover-" + item._id}
                            >
                              {/* <PopoverHeader>Popover Title</PopoverHeader> */}
                              <PopoverBody> {item.reason}</PopoverBody>
                            </UncontrolledPopover>
                          </td>
                        ) : (
                            <td className="cmt-section">{item.reason}</td>
                          )}
                                 <td className="tbl-date"><div className="customtooltip">
                                        <button
                                          className="btn btn-xs"
                                          type="button"
                                          onClick={() => this.showComment(item._id)}
                                          data-toggle="modal"
                                          data-target="#Chatcmt"
                                        >
                                          <i className="fa fa-comments font comment"></i>
                                        </button>
                                        <span className="tooltiptext">Comment</span>
                                      </div></td>
                        <td className="tbl-date">{item.leave_type}</td>

                          <td className="tbl-date">
                            {/* <p>{item.message}</p>{" "} */}
                            {item.message == "Approved By HR" ? (
                              <div>
                                <button className="btn btn-default tech leave-details btn-rounded m-r-20">
                                  Tech
                            </button>
                                <button className="btn btn-success hr-mang btn-rounded">
                                  HR
                            </button>
                              </div>
                            ) : (
                                <div>
                                  {item.message == "Approved By Delivery Head" ? (
                                    <div>
                                      <button className="btn btn-success tech leave-details m-r-20 btn-rounded">
                                        Tech
                                </button>
                                      <button className="btn hr-mang btn-default btn-rounded">
                                        HR
                                </button>
                                    </div>
                                  ) : (
                                      <div>
                                        <button className="btn tech leave-details btn-default m-r-20 btn-rounded">
                                          Tech
                                </button>
                                        <button className="btn hr-mang btn-default btn-rounded">
                                          HR
                                </button>
                                      </div>
                                    )}
                                </div>
                              )}
                          </td>
                        
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-page">
                <Pagination
                  className="justify-content-center"
                  activePage={this.state.activePage}
                  itemsCountPerPage={8}
                  totalItemsCount={100}
                  pageRangeDisplayed={3}
                  onChange={this.handleClick}
                  itemClass="page-item no-padding"
                  linkClass="page-link"
                  prevPageText="Previous"
                  nextPageText="Next"
                  totalItemsCount={this.state.items.length}
                />
              </div>
            </div>
          </div>
          <ModalWindow show={this.state.showModal} container={this} />
        </div>
      );
    }
  }
  handleAlertClass() {
    let classes = "alert alert-dismissable fade show alertpopup ";
    classes += this.state.danger == true ? "alert-danger" : "alert-success";
    return classes;
  }
}
