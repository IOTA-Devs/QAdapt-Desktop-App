import {Payment, columns} from "../components/custom/columns"
import {DataTable} from "../components/custom/data-table"

async function getData(): Promise<Payment[]> {
	return [
		{
			id: "728ed52f",
			amount: 100,
			status: "pending",
			email: "m@example.com",
		},
	]
}

export default function Collections() {
	//const data = await getData()
	const data = [
		{
			id: "728ed52f",
			amount: 100,
			status: "pending",
			email: "m@example.com",
		},
	]
    return(
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
