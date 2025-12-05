const MarkerLegend = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Active */}
      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
          alt="Offer Active"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">Offer Active</span>
      </div>

      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
          alt="Request Active"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">Request Active</span>
      </div>

      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
          alt="Alert Active"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">Alert Active</span>
      </div>

      {/* In Progress */}
      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
          alt="In Progress"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">In Progress</span>
      </div>

      {/* Completed */}
      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png"
          alt="Completed"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">Completed</span>
      </div>

      {/* Cancelled */}
      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-black.png"
          alt="Cancelled"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">Cancelled</span>
      </div>

      {/* Archived */}
      <div className="flex items-center gap-1">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png"
          alt="Archived"
          className="w-5 h-7"
        />
        <span className="text-xs text-gray-700">Archived</span>
      </div>
    </div>
  );
};

export default MarkerLegend;
