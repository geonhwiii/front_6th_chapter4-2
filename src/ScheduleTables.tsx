import { Button, ButtonGroup, Flex, Heading, Stack } from "@chakra-ui/react";
import { useState, useCallback, memo } from "react";
import { useScheduleContext, useScheduleTable } from "./ScheduleContext";
import ScheduleTable from "./ScheduleTable";
import ScheduleDndProvider from "./ScheduleDndProvider";
import SearchDialog from "./SearchDialog";

const ScheduleTableWithDnd = memo(({ tableId, onScheduleTimeClick, onDeleteButtonClick }: { 
  tableId: string;
  onScheduleTimeClick: (timeInfo: { day: string; time: number }) => void;
  onDeleteButtonClick: (timeInfo: { day: string; time: number }) => void;
}) => {
  const { schedules } = useScheduleTable(tableId);

  return (
    <ScheduleDndProvider tableId={tableId}>
      <ScheduleTable
        schedules={schedules}
        tableId={tableId}
        onScheduleTimeClick={onScheduleTimeClick}
        onDeleteButtonClick={onDeleteButtonClick}
      />
    </ScheduleDndProvider>
  );
});

export const ScheduleTables = () => {
  const { schedulesMap, setSchedulesMap } = useScheduleContext();
  const [searchInfo, setSearchInfo] = useState<{
    tableId: string;
    day?: string;
    time?: number;
  } | null>(null);

  const disabledRemoveButton = Object.keys(schedulesMap).length === 1;

  const duplicate = useCallback((targetId: string) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [`schedule-${Date.now()}`]: [...prev[targetId]],
    }));
  }, [setSchedulesMap]);

  const remove = useCallback((targetId: string) => {
    setSchedulesMap((prev) => {
      delete prev[targetId];
      return { ...prev };
    });
  }, [setSchedulesMap]);

  const handleScheduleTimeClick = useCallback((tableId: string) => (timeInfo: { day: string; time: number }) => {
    setSearchInfo({ tableId, ...timeInfo });
  }, []);

  const handleDeleteButtonClick = useCallback((tableId: string) => ({ day, time }: { day: string; time: number }) => {
    setSchedulesMap((prev) => ({
      ...prev,
      [tableId]: prev[tableId].filter(
        (schedule) =>
          schedule.day !== day || !schedule.range.includes(time),
      ),
    }));
  }, [setSchedulesMap]);

  return (
    <>
      <Flex w="full" gap={6} p={6} flexWrap="wrap">
        {Object.entries(schedulesMap).map(([tableId], index) => (
          <Stack key={tableId} width="600px">
            <Flex justifyContent="space-between" alignItems="center">
              <Heading as="h3" fontSize="lg">
                시간표 {index + 1}
              </Heading>
              <ButtonGroup size="sm" isAttached>
                <Button
                  colorScheme="green"
                  onClick={() => setSearchInfo({ tableId })}
                >
                  시간표 추가
                </Button>
                <Button
                  colorScheme="green"
                  mx="1px"
                  onClick={() => duplicate(tableId)}
                >
                  복제
                </Button>
                <Button
                  colorScheme="green"
                  isDisabled={disabledRemoveButton}
                  onClick={() => remove(tableId)}
                >
                  삭제
                </Button>
              </ButtonGroup>
            </Flex>
            <ScheduleTableWithDnd 
              tableId={tableId} 
              onScheduleTimeClick={handleScheduleTimeClick(tableId)}
              onDeleteButtonClick={handleDeleteButtonClick(tableId)}
            />
          </Stack>
        ))}
      </Flex>
      <SearchDialog
        searchInfo={searchInfo}
        onClose={() => setSearchInfo(null)}
      />
    </>
  );
};
