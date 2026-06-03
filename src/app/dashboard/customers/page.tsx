"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomers } from "@/lib/hooks/use-customers";

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useCustomers(search);
  const customers = data?.customers || [];

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Customers
        </h1>
        <p className="mt-1 text-sm text-gray-400 sm:text-base">
          Review buyer details, balances, and sales activity.
        </p>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search customers by name, TIN, or phone..."
              className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">
            Customers ({customers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-brand-yellow-500" />
            </div>
          ) : error ? (
            <p className="py-12 text-center text-sm text-red-400">
              Failed to load customers.
            </p>
          ) : customers.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-sm font-medium text-white">
                No customers found
              </p>
              <p className="mt-1 text-sm text-gray-400">
                Save buyers from sales invoices to build this list.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">TIN</TableHead>
                    <TableHead className="hidden text-gray-300 md:table-cell">
                      Contact
                    </TableHead>
                    <TableHead className="hidden text-gray-300 sm:table-cell">
                      Type
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow
                      key={customer.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell>
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="block"
                        >
                          <p className="font-medium text-white">
                            {customer.legalName ||
                              customer.tradeName ||
                              "Unnamed customer"}
                          </p>
                          {customer.tradeName && customer.legalName && (
                            <p className="text-sm text-gray-400">
                              {customer.tradeName}
                            </p>
                          )}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-gray-300">
                        {customer.tin || "—"}
                      </TableCell>
                      <TableCell className="hidden text-gray-300 md:table-cell">
                        {customer.phone || customer.email || "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="border-white/10 bg-white/5 text-gray-300">
                          {customer.type}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
