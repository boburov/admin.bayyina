// Icons
import { Eye } from "lucide-react";

// React
import { useRef, useState } from "react";

// Data
import {
  marketOrderStatusLabels,
  marketOrderStatusClasses,
  marketOrderStatusOptions,
} from "@/features/market/data/market.data";

// Hooks
import useModal from "@/shared/hooks/useModal";

// Tanstack Query
import { useQuery } from "@tanstack/react-query";

// API
import { marketAPI } from "@/features/market/api/market.api";

// Utils
import { formatUzDate } from "@/shared/utils/formatDate";

// Components
import Card from "@/shared/components/ui/Card";
import Select from "@/shared/components/ui/select/Select";
import Pagination from "@/shared/components/ui/Pagination";

/**
 * Admin orders management page.
 * @returns {JSX.Element} Orders page.
 */
const MarketOrdersPage = () => {
  const contentRef = useRef(null);
  const { openModal } = useModal();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["market", "admin", "orders", page, status],
    queryFn: () =>
      marketAPI
        .getOrders({
          page,
          limit: 20,
          ...(status !== "all" ? { status } : {}),
        })
        .then((response) => response.data),
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div ref={contentRef} className="space-y-4">
      {/* Top */}
      <div className="flex items-end justify-between gap-3">
        <h1 className="page-title">Buyurtmalar</h1>

        <Select
          value={status}
          options={marketOrderStatusOptions}
          onChange={(value) => {
            setPage(1);
            setStatus(value);
          }}
        />
      </div>

      <div>
        {isLoading ? (
          <div className="text-center py-8">Yuklanmoqda...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Buyurtmalar mavjud emas
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-white">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left">O'quvchi</th>
                  <th className="px-4 py-3 text-left">Mahsulot</th>
                  <th className="px-4 py-3 text-left">Miqdor</th>
                  <th className="px-4 py-3 text-left">Narx</th>
                  <th className="px-4 py-3 text-left">Holat</th>
                  <th className="px-4 py-3 text-left">Sana</th>
                  <th className="px-4 py-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 align-top">
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium">
                        {order.student?.firstName} {order.student?.lastName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>
                        {order.productSnapshot?.name || order.product?.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.quantity} ta</td>
                    <td className="px-4 py-3 text-sm">
                      {order.totalPrice} coin
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          marketOrderStatusClasses[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {marketOrderStatusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatUzDate(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {order.status === "pending" ? (
                        <button
                          className="inline-flex size-9 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-100"
                          onClick={() =>
                            openModal("updateMarketOrderStatus", {
                              sessionId: Date.now(),
                              orderId: order._id,
                              orderStatus: order.status,
                            })
                          }
                        >
                          <Eye className="size-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Yakunlangan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination?.totalPages > 1 && (
        <Pagination
          contentRef={contentRef}
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={(nextPage) => setPage(nextPage)}
          className="pt-2"
        />
      )}
    </div>
  );
};

export default MarketOrdersPage;
