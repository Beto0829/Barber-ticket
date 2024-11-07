import { useState } from "react";
import { FaSearch } from "react-icons/fa"; // Importamos el ícono de lupa
import { getFirestore, doc, getDoc } from "firebase/firestore";

const TicketSearchComponent = () => {
    const [isSearchVisible, setSearchVisible] = useState(false);
    const [searchName, setSearchName] = useState("");
    const [ticketNumber, setTicketNumber] = useState<number | null>(null);
  
    const db = getFirestore();
  
    // Función para alternar la visibilidad del campo de búsqueda
    const handleSearchIconClick = () => {
      setSearchVisible((prev) => !prev);
    };
  
    // Función para buscar el ticket en el array del documento en Firebase
    const handleSearch = async () => {
      if (searchName.trim() === "") return;
  
      try {
        // Accede al documento "Tickets" en la colección "Turns"
        const docRef = doc(db, "Turns", "Tickets");
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          // Obtén el array de objetos del documento
          const ticketArray = docSnap.data().tickets; // Cambia "tickets" si el array tiene otro nombre
  
          // Busca el objeto dentro del array que coincide con el nombre
          const ticket = ticketArray.find((item: any) => item.nombre === searchName);
  
          if (ticket) {
            setTicketNumber(ticket.numero); // Asigna el número de turno si encuentra el nombre
          } else {
            setTicketNumber(null); // Si no se encuentra el nombre
          }
        } else {
          console.log("No se encontró el documento.");
        }
      } catch (error) {
        console.error("Error buscando el ticket:", error);
      }
    };
  
    return (
      <div className="relative">
        {/* Icono de búsqueda */}
        <button
          onClick={handleSearchIconClick}
          className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800"
        >
          <FaSearch size={20} />
          <span>Iniciar Sesión</span>
        </button>
  
        {/* Campo de búsqueda condicional */}
        {isSearchVisible && (
          <div className="absolute top-full left-0 mt-2 w-64 p-4 bg-white/90 border border-gray-300 rounded-lg shadow-lg">
            <input
              type="text"
              placeholder="Ingresa tu nombre"
              className="w-full p-2 rounded-md border border-gray-300 focus:outline-none"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
            >
              Buscar Ticket
            </button>
          </div>
        )}
  
        {/* Muestra el resultado de la búsqueda */}
        {ticketNumber !== null && (
          <div className="mt-4 p-4 bg-white/10 text-white border border-gray-300 rounded-lg shadow-lg text-center max-w-md mx-auto backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-gray-100">Tu Número de Ticket:</h2>
            <p className="text-2xl font-bold text-blue-500 mt-2">{ticketNumber}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default TicketSearchComponent;