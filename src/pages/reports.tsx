import { useParams } from 'react-router-dom';

export default function Reports() {
    const { testId } = useParams();

    return (
        <>
            <p>Report with test ID: {testId}</p>
        </>
    );
}