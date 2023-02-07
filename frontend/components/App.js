import React, { useEffect, useState } from 'react'
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import Articles from './Articles'
import LoginForm from './LoginForm'
import Message from './Message'
import ArticleForm from './ArticleForm'
import Spinner from './Spinner'
import axios from 'axios'
import axiosWithAuth from '../axios'

const articlesUrl = 'http://localhost:9000/api/articles'
const loginUrl = 'http://localhost:9000/api/login'

export default function App() {
  // ✨ MVP can be achieved with these states
  const [message, setMessage] = useState('')
  const [articles, setArticles] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState()
  const [spinnerOn, setSpinnerOn] = useState(false)
  const [currentArticle, setCurrentArticle] = useState()

  useEffect(() => {
    setCurrentArticle(articles.find(art => art.article_id === currentArticleId))
  }, [currentArticleId])

  // ✨ Research `useNavigate` in React Router v.6
  const navigate = useNavigate()
  const redirectToLogin = () => navigate('/')
  const redirectToArticles = () => navigate('/articles')

  const resetArticles = () => {
    axiosWithAuth().get('/articles')
      .then(res => setArticles(res.data.articles))
  }
  const logout = () => {
    localStorage.removeItem('token');
    setMessage("Goodbye!");
    redirectToLogin()
    // ✨ implement
    // If a token is in local storage it should be removed,
    // and a message saying "Goodbye!" should be set in its proper state.
    // In any case, we should redirect the browser back to the login screen,
    // using the helper above.

  }

  const login = ({ username, password }) => {
    setMessage('');
    setSpinnerOn(true);
    axios.post(loginUrl, { username: username.trim(), password: password.trim() }).then(res => {
      // console.log(res)
      localStorage.setItem("token", res.data.token);
      setMessage(res.data.message);
      setSpinnerOn(false);
      redirectToArticles()
    }).catch(err => console.log(err))


    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch a request to the proper endpoint.
    // On success, we should set the token to local storage in a 'token' key,
    // put the server success message in its proper state, and redirect
    // to the Articles screen. Don't forget to turn off the spinner!
  }

  const getArticles = () => {
    setMessage('');
    setSpinnerOn(true);
    axiosWithAuth()
      .get('/articles')
      .then(res => {
        setArticles(res.data.articles)
        setMessage(res.data.message)
        setSpinnerOn(false)
      })
      .catch(err => {
        if (err.status === 401) {
          redirectToLogin()
        }
        setSpinnerOn(false)
      })
    // ✨ implement
    // We should flush the message state, turn on the spinner
    // and launch an authenticated request to the proper endpoint.
    // On success, we should set the articles in their proper state and
    // put the server success message in its proper state.
    // If something goes wrong, check the status of the response:
    // if it's a 401 the token might have gone bad, and we should redirect to login.
    // Don't forget to turn off the spinner!
  }

  const postArticle = article => {
    axiosWithAuth().post('/articles', { title: article.title.trim(), text: article.text.trim(), topic: article.topic })
      .then(res => {
        console.log(res.data)
        setMessage(res.data.message)
        // setArticles([...articles, res.data.article
        // ])
        resetArticles()
      })
      .catch(err => console.log(err))
    // ✨ implement
    // The flow is very similar to the `getArticles` function.
    // You'll know what to do! Use log statements or breakpoints
    // to inspect the response from the server.

  }

  const updateArticle = ({ article_id, article }) => {
    axiosWithAuth().put(`/articles/${article_id}`, { title: article.title.trim(), text: article.text.trim(), topic: article.topic })
      .then(res => {
        setMessage(res.data.message)
        resetArticles()
      })
      .catch(err => console.log(err));
    // ✨ implement
    // You got this!
  }

  const deleteArticle = article_id => {
    axiosWithAuth().delete(`/articles/${article_id}`)
      .then(res => {
        setMessage(res.data.message)
        resetArticles()
      })
      .catch(err => console.log(err));
    // ✨ implement
  }

  return (
    // ✨ fix the JSX: `Spinner`, `Message`, `LoginForm`, `ArticleForm` and `Articles` expect props ❗
    <>
      <Spinner on={spinnerOn} />
      <Message message={message} />
      <button id="logout" onClick={logout}>Logout from app</button>
      <div id="wrapper" style={{ opacity: spinnerOn ? "0.25" : "1" }}> {/* <-- do not change this line */}
        <h1>Advanced Web Applications</h1>
        <nav>
          <NavLink id="loginScreen" to="/">Login</NavLink>
          <NavLink id="articlesScreen" to="/articles">Articles</NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<LoginForm login={login} />} />
          <Route path="articles" element={
            <>
              <ArticleForm
                // currentArticle={articles.find(art => art.article_id === currentArticleId)}
                currentArticle={currentArticle}
                postArticle={postArticle}
                updateArticle={updateArticle}
                setCurrentArticleId={setCurrentArticleId}
              />
              <Articles
                articles={articles}
                getArticles={getArticles}
                setCurrentArticleId={setCurrentArticleId}
                currentArticleId={currentArticleId}
                deleteArticle={deleteArticle}
              />
            </>
          } />
        </Routes>
        <footer>Bloom Institute of Technology 2022</footer>
      </div>
    </>
  )
}
