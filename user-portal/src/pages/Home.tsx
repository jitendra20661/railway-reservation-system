import SearchForm from "../components/SearchForm";

function Home() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ margin: "5em auto" }}>
      {user && (
        <div>
          <SearchForm />
        </div>
      )}
    </div>
  );
}

export default Home;
