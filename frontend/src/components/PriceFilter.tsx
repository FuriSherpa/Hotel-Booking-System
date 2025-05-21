type Props = {
    selectedPrice?: number;
    onChange: (value?: number) => void;
};

const PriceFilter = ({ selectedPrice, onChange }: Props) => {
    return (
        <div>
            <h4 className="text-md font-semibold mb-2">Max Price</h4>
            <input
                type="number"
                className="p-2 border rounded-md w-full"
                value={selectedPrice || ''}
                min={0}
                placeholder="Enter maximum price"
                onChange={(event) =>
                    onChange(event.target.value ? parseInt(event.target.value) : undefined)}
            />
        </div>
    );
};

export default PriceFilter;