export type Props = {
    page: number;
    pages: number;
    onPageChange: (page: number) => void;
}

const Pagination = ({ page, pages, onPageChange }: Props) => {
    const pageNumbers = [];
    for (let i = 1; i <= pages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center items-center gap-4 py-4">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer disabled:bg-gray-300 disabled:text-gray-600 hover:bg-blue-700 transition duration-300 ease-in-out"
            >
                &#8592; Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center">
                <ul className="flex gap-2">
                    {pageNumbers.map((number) => (
                        <li key={number} className="relative">
                            <button
                                onClick={() => onPageChange(number)}
                                className={`px-3 py-2 rounded-md text-sm font-medium cursor-pointer
                                    ${page === number ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-blue-100'} 
                                    transition duration-200 ease-in-out`}
                            >
                                {number}
                            </button>
                            {page === number && (
                                <span className="absolute inset-0 rounded-md border-2 border-blue-600 pointer-events-none"></span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === pages}
                className="bg-blue-600 text-white p-3 rounded-lg cursor-pointer disabled:bg-gray-300 disabled:text-gray-600 hover:bg-blue-700 transition duration-300 ease-in-out"
            >
                Next &#8594;
            </button>
        </div>
    );
};

export default Pagination;