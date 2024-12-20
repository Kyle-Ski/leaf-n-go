
interface InfoBoxProps {
    message: React.ReactNode;
}

const InfoBox = ({ message }: InfoBoxProps) => {
    return (
        <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded-md shadow-md flex items-start gap-2 m-2">
            <svg className="w-6 h-6 text-blue-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <p className="text-blue-800 font-medium">{ message }</p>
        </div>
    )
}

export default InfoBox