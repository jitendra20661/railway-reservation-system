import SearchForm from "../components/SearchForm";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ margin: "1em auto", minWidth: "80%" }}>
      {user && (
        <div>
          <SearchForm />
        </div>
      )}
    </div>
  );
}

export default Home;
