import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BASE_URL = 'https://car-rental-backend-black.vercel.app/api';

const DamageReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/damagereport`);
      setReports(res.data.reports || []);
    } catch (err) {
      setError('Failed to fetch damage reports');
    } finally {
      setLoading(false);
    }
  };

  const markResolved = async (id) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${BASE_URL}/damagereport/${id}`, { status: 'resolved' });
      fetchReports();
    } catch (err) {
      alert('Failed to update report status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <div>Loading damage reports...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Damage Reports</h2>
      {reports.length === 0 ? (
        <div>No damage reports found.</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="border rounded-lg p-4 bg-white shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-semibold">Booking:</span> {report.booking}
                  <span className="ml-4 font-semibold">Status:</span> <span className={report.status === 'resolved' ? 'text-green-600' : 'text-yellow-600'}>{report.status}</span>
                </div>
                {report.status !== 'resolved' && (
                  <button
                    onClick={() => markResolved(report._id)}
                    disabled={updatingId === report._id}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                  >
                    {updatingId === report._id ? 'Updating...' : 'Mark Resolved'}
                  </button>
                )}
              </div>
              <div className="mb-2">
                <span className="font-semibold">Description:</span> {report.description}
              </div>
              {report.images && report.images.length > 0 && (
                <div className="mb-2">
                  <span className="font-semibold">Images:</span>
                  <div className="flex gap-2 mt-1">
                    {report.images.map((img, idx) => (
                      <img key={idx} src={img} alt="damage" className="w-24 h-24 object-cover rounded border" />
                    ))}
                  </div>
                </div>
              )}
              <div className="text-sm text-gray-500">Report ID: {report._id}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DamageReports;
