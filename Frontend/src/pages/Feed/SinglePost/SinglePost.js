import React, { Component } from "react";

import Image from "../../../components/Image/Image";
import "./SinglePost.css";
import { BACKEND_URL } from "../../../util/constants";

class SinglePost extends Component {
  state = {
    title: "",
    author: "",
    date: "",
    image: "",
    content: "",
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    // fetch(`${BACKEND_URL}/feed/post/${postId}`, {
    //   headers: {
    //     Authorization: `Bearer ${this.props.token}`,
    //   },
    // })
    //   .then((res) => {
    //     if (res.status !== 200) {
    //       throw new Error("Failed to fetch status");
    //     }
    //     return res.json();
    //   })
    //   .then((resData) => {
    //     this.setState({
    //       title: resData.post.title,
    //       author: resData.post.creator.name,
    //       date: new Date(resData.post.createdAt).toLocaleDateString("en-US"),
    //       content: resData.post.content,
    //       image: `${BACKEND_URL}/${resData.post.imageUrl}`,
    //     });
    //   });

    const graphqlQuery = {
      query: `
        query ViewPost($postId:ID!){
          post(id:$postId){
            _id
            title
            creator{
              name
            }
            imageUrl
            content
            createdAt
          }
        }
      `,
      variables: {
        postId,
      },
    };
    fetch(`${BACKEND_URL}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.props.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(graphqlQuery),
    })
      .then((res) => {
        // if (res.status !== 200) {
        //   throw new Error("Failed to fetch status");
        // }
        return res.json();
      })
      .then((resData) => {
        if (resData.errors) {
          throw new Error("Failed to fetch post");
        }
        this.setState({
          title: resData.data.post.title,
          author: resData.data.post.creator.name,
          date: new Date(resData.data.post.createdAt).toLocaleDateString(
            "en-US"
          ),
          content: resData.data.post.content,
          image: `${BACKEND_URL}/${resData.data.post.imageUrl}`,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
