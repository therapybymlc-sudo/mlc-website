import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Spinner } from "@chakra-ui/react";
import { apiGet } from "../../api.js";

export default function ClientAppointments({ client: clientProp, id: idProp }) {
  const context = useOutletContext() || {};
  const client = clientProp || context.client || { name: "Client" };
  const params = useParams() || {};
  const id = idProp || params.id;
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // When backend ready, expose filter ?client=<id>
        const data = await apiGet(`/appointments/`);
        const list = Array.isArray(data) ? data : data.results || [];
        const filtered = list.filter((a) => String(a.client?.id) === String(id) || String(a.client) === String(id));
        if (mounted) setAppts(filtered);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  if (loading) {
    return (
      <Box py={10} textAlign="center">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>Appointments for {client.name}</Heading>
      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>Date & Time</Th>
            <Th>Therapist</Th>
            <Th>Notes</Th>
          </Tr>
        </Thead>
        <Tbody>
          {appts.map((a) => (
            <Tr key={a.id}>
              <Td>{new Date(a.date).toLocaleString()}</Td>
              <Td>{a.therapist?.name || "—"}</Td>
              <Td>{a.notes || "—"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
