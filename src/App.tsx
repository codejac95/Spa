import { useEffect, useState } from 'react';
import Warm from './Warm';
import Cold from './Cold';
import Start from './Start';
import About from './About'
import './App.css'

function App() {
  const [page, setPage] = useState<string>("");

  useEffect(() => {
    if (!page) {
      const queryParameters = new URLSearchParams(window.location.search)
      const getUrl = queryParameters.get("page")
  
      if (getUrl && (getUrl === "warm" || getUrl === "cold" || getUrl === "start")) {
        setPage(getUrl);
      } else {
        setPage("start");
      }
    }

    setPage(currentPage => {
      window.history.pushState(
        null,
        "",
        "?page=" + currentPage
      );
      return currentPage;
    });
  }, [page]);
  
  return (
    <>
      <h1>Jacobs Spa & Vin</h1>
      <button onClick={() => setPage("start")}>Startsida</button>
      <div>
          <button onClick={() => setPage("about")}>Om oss</button>
          <button onClick={() => setPage("warm")}>Varma avdelningen</button>
          <button onClick={() => setPage("cold")}>Kalla avdelningen</button>
      </div>
      {
        {
          "about":<About/>,
          "warm": <Warm/>,
          "cold": <Cold/>,
          "start":<Start/>
        } [page]
      }
    </>
  );
}

export default App
