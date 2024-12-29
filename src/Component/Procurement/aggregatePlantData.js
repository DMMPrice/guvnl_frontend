export const aggregatePlantData = (responses) => {
  const aggregation = {
    startTimestamp: responses[0]?.TimeStamp || null,
    endTimestamp: responses[responses.length - 1]?.TimeStamp || null,
    totalIEXData: {
      Pred_Price: 0,
      Qty_Pred: 0,
    },
    plants: {},
  };

  responses.forEach((response) => {
    const { Must_Run, Remaining_Plants, IEX_Data } = response;

    // Aggregate IEX data
    aggregation.totalIEXData.Pred_Price += IEX_Data.Pred_Price || 0;
    aggregation.totalIEXData.Qty_Pred += IEX_Data.Qty_Pred || 0;

    // Normalize Remaining_Plants to match Must_Run structure
    const normalizedRemaining = Remaining_Plants.map((plant) => ({
      plant_name: plant.name,
      generated_energy: plant.generation,
      net_cost: plant.cost,
      type: plant.Type,
      Variable_Cost: plant.Variable_Cost || 0,
    }));

    const allPlants = [...Must_Run, ...normalizedRemaining];

    allPlants.forEach((plant) => {
      const { plant_name, generated_energy, net_cost, Variable_Cost, type } =
        plant;

      if (!aggregation.plants[plant_name]) {
        aggregation.plants[plant_name] = {
          plant_name,
          total_generated_energy: 0,
          total_net_cost: 0,
          type: type || "Must - Run",
          total_variable_cost: 0,
          count: 0,
        };
      }

      aggregation.plants[plant_name].total_generated_energy +=
        generated_energy || 0;
      aggregation.plants[plant_name].total_net_cost += net_cost || 0;
      aggregation.plants[plant_name].total_variable_cost += Variable_Cost || 0;
      aggregation.plants[plant_name].count += 1;
    });
  });

  return aggregation;
};
