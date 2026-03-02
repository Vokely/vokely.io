export default function Spinner({size="12"}){
    return(
        <div className="flex items-center justify-center h-full">
            <div className={`w-${size} h-${size} border-4 border-t-transparent border-primary rounded-full animate-spin`}></div>
        </div>
    )
}