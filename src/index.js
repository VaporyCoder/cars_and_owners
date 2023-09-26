import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";

const App = () => {
  const [owners, setOwners] = useState([]);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const fetchOwners = async () => {
      const response = await axios.get("/api/owners");
      setOwners(response.data);
    };
    fetchOwners();
  }, []);

  useEffect(() => {
    const fetchCars = async () => {
      const response = await axios.get("/api/Cars");
      setCars(response.data);
    };
    fetchCars();
  }, []);

  const makeOwner = async(car, owner)=> {
    car = {...car, owner_id: owner.id};
    await axios.put(`/api/cars/${car.id}`)
  }

  return (
    <div>
      <h1>Cars Tracker</h1>
      <main>
        <div>
          <h2>Owners({owners.length})</h2>
          <ul>
            {owners.map((owner) => {
              const ownersCars = cars.filter(
                (car) => car.owner_id === owner.id
              );
              return (
                <li key={owner.id}>
                  {owner.name} ({ownersCars.length})
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h2>Cars({cars.length})</h2>
          <ul>
            {cars.map((car) => {
              return (
                <li key={car.id}>
                  {car.name}
                  <ul>
                    {owners.map((owner) => {
                      return (
                        <li
                          key={owner.id}
                          className={car.owner_id === owner.id ? "owner" : ""}
                        >
                          {owner.name}
                          {
                            car.owner_id === owner.id ? (
                              <button>Revoke Owner</button>
                            ):(
                              <button onClick={()=> makeOwner(car, owner)}>Make Owner</button>
                            )
                            }
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(<App />);
