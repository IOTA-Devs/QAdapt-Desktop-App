import {columns} from "./columns"
import {DataTable} from "./data-table"
import {useState, useEffect, useContext} from "react";
import {AuthContext} from "@/contexts/authContext";

export default function CollectionTable() {
	const {APIProtected} = useContext(AuthContext);
	let myData = localStorage.getItem('userData');
	console.log(myData);
	//const data = await getData()
	const [data, setData] = useState([]);
	useEffect(() => {
		const fetchData = async() => {
			const res = await APIProtected.get('/api/collection');
			setData(res.data);
		};
		fetchData();
	}, [])
    return(
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
